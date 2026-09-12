use crate::command::SurfaceId;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Axis {
    Horizontal,
    Vertical,
}

#[derive(Clone, Debug, PartialEq)]
pub enum LayoutNode {
    Surface(SurfaceId),
    Split {
        axis: Axis,
        ratio: f32,
        first: Box<Self>,
        second: Box<Self>,
    },
}

impl LayoutNode {
    pub fn standard() -> Self {
        Self::Split {
            axis: Axis::Horizontal,
            ratio: 0.25,
            first: Box::new(Self::Surface(SurfaceId::FILE_TREE)),
            second: Box::new(Self::Surface(SurfaceId::EDITOR)),
        }
    }
    pub fn focus() -> Self {
        Self::Surface(SurfaceId::EDITOR)
    }
    pub fn contains(&self, id: SurfaceId) -> bool {
        match self {
            Self::Surface(surface) => *surface == id,
            Self::Split { first, second, .. } => first.contains(id.clone()) || second.contains(id),
        }
    }
}
