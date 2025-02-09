#![no_std]
#![no_main]
#![feature(lang_items)]

use core::panic::PanicInfo;
use arbitrum_std::{
    debug_println,
    entrypoint,
};

#[entrypoint]
pub fn main() -> u64 {
    debug_println!("Hello, World!");
    0
}

#[panic_handler]
fn handle_panic(_info: &PanicInfo) -> ! {
    loop {}
}

#[lang = "eh_personality"]
extern "C" fn eh_personality() {}