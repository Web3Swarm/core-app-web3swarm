use stylus::prelude::*;

#[stylus::contract]
pub struct HelloWorld {
    message: String,
}

impl Default for HelloWorld {
    fn default() -> Self {
        Self {
            message: String::from("Hello, World!"),
        }
    }
}

impl HelloWorld {

    #[payable]
    pub fn new(message: String) -> Self {
        Self { message }
    }

    pub fn echo(&self) -> String {
        return self.message.clone();
    }
}