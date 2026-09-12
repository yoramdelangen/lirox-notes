mod args;
mod id;
mod invocation;
mod registry;

pub use args::{CommandArgs, Direction, SurfaceId};
pub use id::CommandId;
pub use invocation::{CommandInvocation, CommandSource};
pub use registry::{CommandDescriptor, CommandRegistry};

#[cfg(test)]
mod tests {
    use super::*;

    fn descriptor(id: &str) -> CommandDescriptor {
        CommandDescriptor {
            id: CommandId::new(id),
            title: "Save",
            description: "Save the current document",
        }
    }

    #[test]
    fn command_ids_compare_by_value() {
        assert_eq!(CommandId::new("editor.save"), CommandId::new("editor.save"));
    }

    #[test]
    fn registry_rejects_duplicate_ids() {
        let mut registry = CommandRegistry::default();
        registry.register(descriptor("editor.save")).unwrap();
        assert!(registry.register(descriptor("editor.save")).is_err());
    }

    #[test]
    fn registry_looks_up_registered_descriptors() {
        let mut registry = CommandRegistry::default();
        registry.register(descriptor("editor.save")).unwrap();

        assert_eq!(
            registry
                .lookup(&CommandId::new("editor.save"))
                .map(|descriptor| descriptor.title),
            Some("Save")
        );
    }
}
