import { Command } from 'commander';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const initCommand = new Command('init');

initCommand
  .description('Initialize gotsync configuration and example schema')
  .option('-f, --force', 'overwrite existing files')
  .action((options: { force?: boolean }) => {
    const cwd = process.cwd();
    const configPath = join(cwd, 'gotsync.config.json');
    const schemasDir = join(cwd, 'schemas');
    const schemaPath = join(schemasDir, 'learning.yaml');

    // Check if files exist
    if (!options.force && (existsSync(configPath) || existsSync(schemaPath))) {
      console.error('Configuration or schema files already exist. Use --force to overwrite.');
      process.exit(1);
    }

    // Create schemas directory
    mkdirSync(schemasDir, { recursive: true });

    // Create example configuration
    const exampleConfig = {
      "schema": "./schemas/learning.yaml",
      "output": {
        "go": {
          "path": "./generated/go",
          "package": "models"
        },
        "typescript": {
          "path": "./generated/ts",
          "module": "commonjs"
        }
      }
    };

    // Create example OpenAPI schema
    const openApiSchema = `openapi: 3.0.3
info:
  title: Learning API
  description: A simple learning management API
  version: 1.0.0
  
paths:
  /courses:
    get:
      summary: Get all courses
      description: Retrieve a list of all available courses
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Course'
    post:
      summary: Create a new course
      description: Create a new course in the system
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateCourseRequest'
      responses:
        '201':
          description: Course created successfully
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Course'
                
  /courses/{courseId}:
    get:
      summary: Get a course by ID
      description: Retrieve a specific course by its ID
      parameters:
        - name: courseId
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Course'
        '404':
          description: Course not found

components:
  schemas:
    Course:
      type: object
      required:
        - id
        - title
        - instructor
      properties:
        id:
          type: string
          description: Unique identifier for the course
          example: "course-123"
        title:
          type: string
          description: Course title
          example: "Introduction to TypeScript"
        instructor:
          type: string
          description: Course instructor name
          example: "John Doe"
        description:
          type: string
          description: Course description
          example: "Learn the basics of TypeScript programming"
        duration:
          type: integer
          description: Course duration in minutes
          example: 120
        isActive:
          type: boolean
          description: Whether the course is currently active
          example: true
        tags:
          type: array
          items:
            type: string
          description: Course tags
          example: ["programming", "typescript", "beginner"]
          
    CreateCourseRequest:
      type: object
      required:
        - title
        - instructor
      properties:
        title:
          type: string
          description: Course title
          example: "Advanced JavaScript"
        instructor:
          type: string
          description: Course instructor name
          example: "Jane Smith"
        description:
          type: string
          description: Course description
          example: "Deep dive into advanced JavaScript concepts"
        duration:
          type: integer
          description: Course duration in minutes
          example: 180
        tags:
          type: array
          items:
            type: string
          description: Course tags
          example: ["programming", "javascript", "advanced"]
`;

    // Write files
    try {
      writeFileSync(configPath, JSON.stringify(exampleConfig, null, 2));
      writeFileSync(schemaPath, openApiSchema);
      
      console.log('✅ Successfully initialized gotsync!');
      console.log(`📄 Created: ${configPath}`);
      console.log(`📄 Created: ${schemaPath}`);
      console.log('');
      console.log('Next steps:');
      console.log('1. Edit schemas/learning.yaml to define your API schema');
      console.log('2. Run "gotsync generate" to create Go and TypeScript types');
    } catch (error) {
      console.error('❌ Error creating files:', error);
      process.exit(1);
    }
  });

export { initCommand }; 