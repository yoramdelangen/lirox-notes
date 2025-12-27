use std::{fs, path::PathBuf};

use iced::widget::{sensor::Key, text_editor};

#[derive(Debug, Clone)]
pub enum ItemType {
    Dir,
    File,
}

#[derive(Clone, Debug)]
pub struct File {
    /// Name of the folder or file (excl. extension).
    /// Can become a nice-name in the future.
    pub name: String,
    /// Relative path of the file
    pub path: String,
    /// Filename of the file with ext. or root file of directory
    pub filename: Option<String>,
    /// Type of the Item
    pub item_type: ItemType,
}

impl File {
    pub fn save(&self, content: text_editor::Content) {

    }
}

#[derive(Debug, Clone)]
pub enum FlError {
    NotExists,
}
impl std::fmt::Display for FlError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(
            f,
            "FileLib Error: {}",
            match self {
                FlError::NotExists => "Path does not exists",
            }
        )
    }
}

#[derive(Clone)]
pub struct FileLib {
    root: PathBuf,
    index_files: Vec<String>,
}

impl FileLib {
    pub fn new(root: PathBuf) -> Self {
        Self {
            root,
            index_files: vec![
                "README.md".to_owned(),
                "root.md".to_owned(),
                "index.md".to_owned(),
            ],
        }
    }

    pub fn get_content(&self, file: &File) -> text_editor::Content {
        println!("Content: {:?}", file);

        let content = match file.item_type {
            ItemType::Dir => match &file.filename {
                Some(file) => {
                    let p = self.root.join(file);

                    if !p.exists() {
                        // return Err(FlError::NotExists);
                    }

                    std::fs::read_to_string(p).unwrap_or("Cannot read file to string".to_owned())
                }
                None => "".to_owned(),
            },
            ItemType::File => std::fs::read_to_string(self.root.join(&file.path))
                .unwrap_or("Cannot read file to string".to_owned()),
        };

        text_editor::Content::with_text(content.as_str())
    }

    /// Detect the root-file from a folder or give abs-filename back.
    fn detect_filename(&self, path: &PathBuf) -> Option<String> {
        if path.is_dir() {
            for f in &self.index_files {
                let x = path.join(f);
                println!("Lookup: {:?}", x);
                if x.exists() {
                    return Some(x.strip_prefix(&self.root).unwrap().display().to_string());
                }
            }

            return None;
        }

        Some(path.file_name().unwrap().display().to_string())
    }

    /// Read location with files.
    pub fn load_items(&self, path: String) -> Result<Vec<File>, FlError> {
        let p = self.root.join(&path);

        if !p.exists() {
            return Err(FlError::NotExists);
        }

        let mut items: Vec<File> = Vec::new();

        // Add navigation items to parent
        if path.len() > 0 {
            let mut parent = p.clone();
            parent.pop();
            items.push(File {
                name: "..".to_owned(),
                path: parent
                    .strip_prefix(&self.root)
                    .unwrap()
                    .display()
                    .to_string(),
                filename: self.detect_filename(&parent),
                item_type: ItemType::Dir,
            });
        }

        let dir = fs::read_dir(p).unwrap();

        for entry in dir {
            let entry = entry.unwrap();
            let path = entry.path();
            let name = path.file_name().unwrap().display().to_string();

            if name == ".DS_Store" || self.index_files.contains(&name) {
                continue;
            }

            items.push(File {
                name,
                path: path.strip_prefix(&self.root).unwrap().display().to_string(),
                filename: self.detect_filename(&path),
                item_type: if path.is_dir() {
                    ItemType::Dir
                } else {
                    ItemType::File
                },
            });
        }

        Ok(items)
    }
}
