#[actix_web::main]
async fn main() -> std::io::Result<()> {
    liroxnotes_gateway::serve(
        liroxnotes_gateway::runtime_paths(),
        liroxnotes_gateway::port_from_args(std::env::args()),
    )
    .await
}
