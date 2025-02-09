#[macro_use]
extern crate stylus_contract;

use stylus_contract::*;

#[stylus_contract]
pub struct HelloWorld {
    greeting: String,
}

impl Default for HelloWorld {
    fn default() -> Self {
        Self {
            greeting: "Hello, World!".to_string(),
        }
    }
}

#[stylus_pub]
impl HelloWorld {
    pub fn greet(&self) {
        println!("{}", self.greeting);
    }
    
    pub fn set_greeting(&mut self, new_greeting: String) {
        self.greeting = new_greeting;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let contract = HelloWorld::default();
        contract.greet();
        assert_eq!(contract.greeting, "Hello, World!");
    }
}