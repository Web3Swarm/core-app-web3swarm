import { Router, RequestHandler } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();
const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECTS_DIR = path.join(__dirname, '../../projects');

// Initialize projects directory
mkdir(PROJECTS_DIR, { recursive: true }).catch(err => 
  console.error('Failed to create projects directory:', err)
);

// Add these constants at the top of the file
const RUST_TOOLCHAIN = `[toolchain]
channel = "nightly-2023-12-31"
components = ["rust-src", "rustc-dev", "llvm-tools-preview"]
profile = "minimal"`;

const CARGO_TOML = `[package]
name = "{project_name}"
version = "0.1.0"
edition = "2021"

[dependencies]
stylus-sdk = "0.4.2"
wee_alloc = "0.4.5"
hex = "0.4.3"

[features]
export-abi = ["stylus-sdk/export-abi"]

[lib]
crate-type = ["cdylib"]

[workspace]
members = ["."]

[profile.release]
codegen-units = 1
strip = true
lto = true
panic = "abort"
opt-level = "z"`;

const STYLUS_TEMPLATE = `#![no_std]
#![no_main]

#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

use stylus_sdk::{prelude::*, msg};

#[no_mangle]
pub extern "C" fn main() {
    // Your code here
}`;

// Add timeout constant at the top with other constants
const COMPILATION_TIMEOUT_MS = 160000; // 160 seconds

// Add helper function for killing processes
const killProcess = async (command: string, cwd: string) => {
    try {
        // First try a graceful kill using process name
        await execAsync(`pgrep -f "${command}" | xargs kill`, { cwd }).catch(() => {});
        
        // Wait a bit and force kill if still running
        await new Promise(resolve => setTimeout(resolve, 1000));
        await execAsync(`pgrep -f "${command}" | xargs kill -9`, { cwd }).catch(() => {});
    } catch (error) {
        console.warn('Process may have already exited:', error);
    }
};

// Add helper function for running commands with timeout
const execWithTimeout = async (command: string, cwd: string, timeoutMs: number) => {
    let processOutput: { stdout: string; stderr: string } | undefined;
    
    try {
        const processPromise = execAsync(command, { cwd });
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Command timed out after ${timeoutMs/1000} seconds: ${command}`));
            }, timeoutMs);
        });

        processOutput = await Promise.race([processPromise, timeoutPromise]) as { stdout: string; stderr: string };
        return processOutput;
    } catch (error) {
        // If timeout occurred, kill the process
        if (!processOutput) {
            console.log(`Command timed out, killing process: ${command}`);
            await killProcess(command, cwd);
        }
        throw error;
    }
};

// Types
interface CompileRequest { code: string }
interface CompileResponse {
  success: boolean;
  output?: string;
  warnings?: string | null;
  error?: string;
  projectName?: string;
}
interface DeployResponse extends CompileResponse {
  contractAddress?: string | null;
  txHash?: string | null;
}

// Add helper function for project cleanup
const cleanupProject = async (projectPath: string) => {
  try {
    await execAsync(`rm -rf ${projectPath}`);
  } catch (error) {
    console.error(`Failed to cleanup project at ${projectPath}:`, error);
  }
};

// Add helper function for project setup
const setupProject = async (code: string) => {
  const timestamp = Date.now();
  const projectName = `stylus_${timestamp}`;
  const projectPath = path.join(PROJECTS_DIR, projectName);

  try {
    // Create project directories
    await mkdir(projectPath, { recursive: true });
    await mkdir(path.join(projectPath, 'src'), { recursive: true });

    // Use provided code or fallback to template
    const rustCode = code.trim() || STYLUS_TEMPLATE;

    // Write all configuration files
    await Promise.all([
      writeFile(path.join(projectPath, 'rust-toolchain.toml'), RUST_TOOLCHAIN),
      writeFile(
        path.join(projectPath, 'Cargo.toml'),
        CARGO_TOML.replace('{project_name}', projectName)
      ),
      writeFile(path.join(projectPath, 'src', 'lib.rs'), rustCode)
    ]);

    return { projectPath, projectName };
  } catch (error) {
    await cleanupProject(projectPath);
    throw error;
  }
};

// Route handlers
const checkContract: RequestHandler<Record<string, never>, CompileResponse, CompileRequest> = async (req, res) => {
    const code = req.body.code?.trim();
    if (!code) {
        res.status(400).json({ success: false, error: 'Code is required' });
        return;
    }

    let projectPath: string | undefined;

    try {
        // Setup project with proper error handling
        const { projectPath: path, projectName } = await setupProject(code);
        projectPath = path;

        // First run cargo build to ensure dependencies are downloaded
        console.log('Building project...');
        await execWithTimeout('cargo build', projectPath, COMPILATION_TIMEOUT_MS);

        // Then run cargo stylus check
        console.log('Running cargo stylus check...');
        const { stdout, stderr } = await execWithTimeout(
            'cargo stylus check',
            projectPath,
            COMPILATION_TIMEOUT_MS
        );

        // Parse warnings and errors
        const warnings = stderr ? stderr.split('\n').filter(line => line.includes('warning:')).join('\n') : null;
        const errors = stderr ? stderr.split('\n').filter(line => line.includes('error:')).join('\n') : null;

        if (errors) {
            throw new Error(errors);
        }

        res.json({ 
            success: true, 
            output: stdout,
            warnings,
            projectName 
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Contract validation failed';
        const isTimeout = errorMessage.includes('timed out');
        
        res.status(isTimeout ? 504 : 500).json({
            success: false,
            error: isTimeout 
                ? `Compilation timed out after ${COMPILATION_TIMEOUT_MS/1000} seconds. Your contract might be too complex or the server is under heavy load.`
                : errorMessage,
            warnings: null
        });
    } finally {
        // Cleanup project directory
        if (projectPath) {
            await cleanupProject(projectPath);
        }
    }
};

const deployContract: RequestHandler<Record<string, never>, DeployResponse, CompileRequest> = async (req, res) => {
    const code = req.body.code?.trim();
    if (!code) {
        res.status(400).json({ success: false, error: 'Code is required' });
        return;
    }

    let projectPath: string | undefined;

    try {
        // Setup project with proper error handling
        const { projectPath: path, projectName } = await setupProject(code);
        projectPath = path;

        // First build the project
        console.log('Building project...');
        await execWithTimeout('cargo build', projectPath, COMPILATION_TIMEOUT_MS);

        // Then deploy
        console.log('Deploying contract...');
        const { stdout, stderr } = await execWithTimeout(
            `cargo stylus deploy --private-key="${process.env.STYLUS_PRIVATE_KEY}" --endpoint="${process.env.STYLUS_RPC_URL}"`,
            projectPath,
            COMPILATION_TIMEOUT_MS * 2 // Double timeout for deployment
        );

        const addressMatch = stdout.match(/Contract deployed at: (0x[a-fA-F0-9]+)/);
        const txHashMatch = stdout.match(/Transaction hash: (0x[a-fA-F0-9]+)/);

        res.json({
            success: true,
            output: stdout,
            warnings: stderr || null,
            contractAddress: addressMatch?.[1] || null,
            txHash: txHashMatch?.[1] || null,
            projectName
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Deployment failed';
        const isTimeout = errorMessage.includes('timed out');
        
        res.status(isTimeout ? 504 : 500).json({
            success: false,
            error: isTimeout 
                ? `Deployment timed out after ${COMPILATION_TIMEOUT_MS * 2/1000} seconds. Your contract might be too complex or the network might be congested.`
                : errorMessage,
            warnings: null
        });
    } finally {
        // Cleanup project directory
        if (projectPath) {
            await cleanupProject(projectPath);
        }
    }
};

router.post('/check', checkContract);
router.post('/deploy', deployContract);

export default router; 