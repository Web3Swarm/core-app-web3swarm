import { Router, Request, Response } from 'express';
import * as fs from 'fs/promises';
import * as path from 'path';
import { execAsync } from '../utils/exec.js';

const router = Router();

// Base project directory
const PROJECTS_DIR = path.join(__dirname, '../../projects');

// Initialize projects directory
const initializeDirectory = async () => {
  try {
    await fs.mkdir(PROJECTS_DIR, { recursive: true });
    console.log('Projects directory initialized at:', PROJECTS_DIR);
  } catch (error) {
    console.error('Failed to create projects directory:', error);
    throw error;
  }
};

// Initialize on module load
initializeDirectory().catch(console.error);

// Constants for project configuration
const RUST_TOOLCHAIN_TOML = `[toolchain]
channel = "nightly-2024-01-30"
components = ["rust-src", "cargo"]
targets = ["wasm32-unknown-unknown"]`;

const CARGO_TOML_TEMPLATE = `[package]
name = "stylus_project"
version = "0.1.7"
edition = "2021"
license = "MIT OR Apache-2.0"
keywords = ["arbitrum", "ethereum", "stylus", "alloy"]

[dependencies]
alloy-primitives = "=0.7.6"
alloy-sol-types = "=0.7.6"
mini-alloc = "0.4.2"
stylus-sdk = "0.6.0"
hex = "0.4.3"

[dev-dependencies]
tokio = { version = "1.12.0", features = ["full"] }
ethers = "2.0"
eyre = "0.6.8"

[features]
export-abi = ["stylus-sdk/export-abi"]

[lib]
crate-type = ["lib", "cdylib"]

[profile.release]
codegen-units = 1
strip = true
lto = true
panic = "abort"
opt-level = "s"`;

const DEFAULT_RUST_CODE = `#![no_std]
use stylus_sdk::prelude::*;

#[storage]
struct Counter {
    number: U256,
}

#[external]
impl Counter {
    pub fn new() -> Self {
        Self { number: U256::from(0) }
    }

    pub fn number(&self) -> U256 {
        self.number
    }

    pub fn setNumber(&mut self, new_number: U256) {
        self.number = new_number;
    }

    pub fn increment(&mut self) {
        self.number += U256::from(1);
    }
}`;

interface ProjectStructure {
    files: string[];
}

// Types for error handling
interface ExecError extends Error {
    stdout?: string;
    stderr?: string;
}

// Helper function to create project structure
const createProjectStructure = async (projectPath: string, code: string): Promise<ProjectStructure> => {
    const files: string[] = [];
    
    try {
        // Create project directory
        await fs.mkdir(projectPath, { recursive: true });
        files.push(projectPath);

        // Create src directory
        const srcPath = path.join(projectPath, 'src');
        await fs.mkdir(srcPath, { recursive: true });
        files.push(srcPath);

        // Write configuration files
        const configFiles = [
            {
                path: path.join(projectPath, 'rust-toolchain.toml'),
                content: RUST_TOOLCHAIN_TOML
            },
            {
                path: path.join(projectPath, 'Cargo.toml'),
                content: CARGO_TOML_TEMPLATE
            },
            {
                path: path.join(srcPath, 'lib.rs'),
                content: code || DEFAULT_RUST_CODE
            }
        ];

        await Promise.all(
            configFiles.map(async (file) => {
                await fs.writeFile(file.path, file.content);
                files.push(file.path);
            })
        );

        return { files };
    } catch (error) {
        // Clean up on error
        await fs.rm(projectPath, { recursive: true, force: true }).catch(console.error);
        throw error;
    }
};

// Create new project route
router.post('/new', async (req: Request, res: Response): Promise<void> => {
  try {
    const projectName = 'stylus_' + Date.now();
    const projectPath = path.join(PROJECTS_DIR, projectName);
    
    const projectStructure = await createProjectStructure(projectPath, req.body.code || DEFAULT_RUST_CODE);
    
    res.json({
      success: true,
      projectName,
      projectPath,
      files: projectStructure.files,
      message: 'Stylus project created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Project creation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Check contract route
router.post('/check', async (req: Request, res: Response): Promise<void> => {
  const projectDir = path.join(PROJECTS_DIR, `stylus_${Date.now()}`);
  
  try {
    // Create project structure
    await createProjectStructure(projectDir, req.body.code);

    try {
      // Run cargo stylus check
      const { stdout, stderr } = await execAsync('cargo stylus check', { cwd: projectDir });
      
      res.json({
        success: true,
        output: stdout,
        warnings: stderr || null
      });
    } catch (execError: unknown) {
      const error = execError as ExecError;
      res.status(400).json({
        success: false,
        error: 'Contract validation failed',
        details: error.stderr || error.message,
        output: error.stdout,
        warnings: error.stderr
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Compilation setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Clean up project directory
    await fs.rm(projectDir, { recursive: true, force: true }).catch(console.error);
  }
});

// Generate ABI route
router.post('/abi', async (req: Request, res: Response): Promise<void> => {
  const projectDir = path.join(PROJECTS_DIR, `stylus_${Date.now()}`);
  
  try {
    // Create project structure
    await createProjectStructure(projectDir, req.body.code);

    try {
      // Export ABI in JSON format
      const { stdout, stderr } = await execAsync('cargo stylus export-abi --json', { cwd: projectDir });
      
      res.json({
        success: true,
        abi: JSON.parse(stdout),
        warnings: stderr || null
      });
    } catch (execError: unknown) {
      const error = execError as ExecError;
      res.status(400).json({
        success: false,
        error: 'ABI generation failed',
        details: error.stderr || error.message
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'ABI generation setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Clean up project directory
    await fs.rm(projectDir, { recursive: true, force: true }).catch(console.error);
  }
});

// Deploy contract route
router.post('/deploy', async (req: Request, res: Response): Promise<void> => {
  const { code, privateKey, endpoint } = req.body;
  
  if (!privateKey || !endpoint) {
    res.status(400).json({
      success: false,
      error: 'Private key and endpoint are required for deployment'
    });
    return;
  }

  const projectDir = path.join(PROJECTS_DIR, `stylus_${Date.now()}`);
  
  try {
    // Create project structure
    await createProjectStructure(projectDir, code);

    try {
      // Deploy the contract
      const { stdout, stderr } = await execAsync(
        `cargo stylus deploy --endpoint="${endpoint}" --private-key="${privateKey}"`,
        { cwd: projectDir }
      );

      // Parse deployment output
      const addressMatch = stdout.match(/Contract address: (0x[a-fA-F0-9]+)/);
      const txHashMatch = stdout.match(/Transaction hash: (0x[a-fA-F0-9]+)/);

      if (!addressMatch || !txHashMatch) {
        throw new Error('Failed to extract contract address or transaction hash from output');
      }

      res.json({
        success: true,
        contractAddress: addressMatch[1],
        txHash: txHashMatch[1],
        output: stdout,
        warnings: stderr || null
      });
    } catch (execError: unknown) {
      const error = execError as ExecError;
      res.status(400).json({
        success: false,
        error: 'Deployment failed',
        details: error.stderr || error.message,
        output: error.stdout,
        warnings: error.stderr
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Deployment setup failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  } finally {
    // Clean up project directory
    await fs.rm(projectDir, { recursive: true, force: true }).catch(console.error);
  }
});

export default router; 