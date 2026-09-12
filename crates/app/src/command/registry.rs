use std::collections::HashMap;

use super::CommandId;

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct CommandDescriptor {
    pub id: CommandId,
    pub title: &'static str,
    pub description: &'static str,
}

#[derive(Debug, Default)]
pub struct CommandRegistry {
    descriptors: HashMap<CommandId, CommandDescriptor>,
}

impl CommandRegistry {
    pub fn register(&mut self, descriptor: CommandDescriptor) -> Result<(), CommandDescriptor> {
        if self.descriptors.contains_key(&descriptor.id) {
            return Err(descriptor);
        }

        self.descriptors.insert(descriptor.id.clone(), descriptor);
        Ok(())
    }

    pub fn lookup(&self, id: &CommandId) -> Option<&CommandDescriptor> {
        self.descriptors.get(id)
    }
}
