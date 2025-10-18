Postman Collection

- Import `postman/SDET-Portfolio-ReqRes.postman_collection.json`.
- Import `postman/SDET-Portfolio-Env.postman_environment.json` and select it when running.
- The collection demonstrates:
  - Variables: `{{baseUrl}}`, `{{email}}`, `{{name}}`, `{{job}}`
  - Pre-request scripts to seed variables and generate a `requestId`
  - Test scripts asserting status, body, and headers
  - Chaining via saved `lastCreatedUserId` collection variable

Tips
- You can override variables at environment or collection scope.
- Try running “Create User” first, then “Update User”.
- Add a new folder and reuse `{{baseUrl}}` to practice.

