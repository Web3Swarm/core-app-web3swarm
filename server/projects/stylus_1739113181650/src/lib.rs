use ink_lang as ink;

#[ink::contract]
mod helloworld {
    #[ink(storage)]
    pub struct HelloWorld {
        value: ink_prelude::string::String,
    }

    impl HelloWorld {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                value: ink_prelude::string::String::from("Hello, World!"),
            }
        }

        #[ink(message)]
        pub fn get_message(&self) -> ink_prelude::string::String {
            self.value.clone()
        }

        #[ink(message)]
        pub fn set_message(&mut self, new_value: ink_prelude::string::String) {
            self.value = new_value;
        }
    }
}