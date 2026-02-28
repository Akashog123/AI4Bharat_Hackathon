from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # App
    app_name: str = "Sahaj API"
    debug: bool = True

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/sahaj"

    # Sarvam AI
    sarvam_api_key: str = ""

    # AWS
    aws_region: str = "ap-south-1"
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    bedrock_model_id: str = "anthropic.claude-sonnet-4-5-20250929-v1:0"
    bedrock_knowledge_base_id: str = ""
    s3_bucket: str = "sahaj-data"

    # CORS
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"

settings = Settings()
