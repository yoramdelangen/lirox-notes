#![cfg(feature = "server")]

use liroxnotes_app::server::workspace_server_function;
use std::future::Future;

#[test]
fn protected_workspace_operation_rejects_a_request_without_a_session_cookie() {
    let result = block_on(workspace_server_function(None));

    assert!(result.is_err());
}

fn block_on<F: Future>(future: F) -> F::Output {
    use std::sync::Arc;
    use std::task::{Context, Poll, Wake, Waker};

    struct NoopWake;
    impl Wake for NoopWake {
        fn wake(self: Arc<Self>) {}
    }

    let waker = Waker::from(Arc::new(NoopWake));
    let mut context = Context::from_waker(&waker);
    let mut future = Box::pin(future);
    loop {
        match future.as_mut().poll(&mut context) {
            Poll::Ready(output) => return output,
            Poll::Pending => std::thread::yield_now(),
        }
    }
}
