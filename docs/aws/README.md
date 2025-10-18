AWS Basics (Interview Cheat‑Sheet)

Core Services
- EC2: virtual servers. Know instance types, security groups, AMIs, autoscaling basics.
- Lambda: serverless functions. Triggers (API Gateway, SQS, EventBridge), cold starts, timeouts.
- API Gateway: managed API front door. Stages, integrations (Lambda/HTTP), authorizers, throttling.
- CloudWatch: logs, metrics, alarms, dashboards. Useful for tracing and alerting.
- S3: object storage. Buckets, versioning, presigned URLs, static hosting.
- RDS/DynamoDB: relational vs. NoSQL managed databases.

Infra as Code
- Terraform basics: providers, resources, variables, outputs, modules, remote state.
- Typical pattern: VPC + subnets + security groups + API Gateway + Lambda + DynamoDB.

Observability
- Distributed tracing with X-Ray; correlation IDs across services.
- CloudWatch Logs Insights for querying structured logs (JSON).

Security
- IAM roles/policies, least privilege, KMS for encryption at rest, TLS in transit.

Testing Tips
- For APIs on API Gateway + Lambda: validate integration response mapping, status codes, and headers.
- For event-driven: use EventBridge/SQS to decouple; test dead-letter queues (DLQ) behavior.

