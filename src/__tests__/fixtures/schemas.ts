/**
 * Test fixtures - Sample schemas for testing
 */

import { OpenAPIV3 } from 'openapi-types';

export const petStoreSchema: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Pet Store API',
    version: '1.0.0',
    description: 'A sample Pet Store API for testing'
  },
  paths: {
    '/pets': {
      get: {
        operationId: 'listPets',
        responses: {
          '200': {
            description: 'List of pets',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Pet'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      Pet: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: {
            type: 'integer',
            format: 'int64',
            description: 'Pet ID'
          },
          name: {
            type: 'string',
            description: 'Pet name',
            minLength: 1,
            maxLength: 100
          },
          category: {
            $ref: '#/components/schemas/Category'
          },
          photoUrls: {
            type: 'array',
            items: {
              type: 'string',
              format: 'url'
            },
            description: 'Pet photos'
          },
          tags: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Tag'
            }
          },
          status: {
            $ref: '#/components/schemas/PetStatus'
          }
        }
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            format: 'int64'
          },
          name: {
            type: 'string'
          }
        }
      },
      Tag: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            format: 'int64'
          },
          name: {
            type: 'string'
          }
        }
      },
      PetStatus: {
        type: 'string',
        enum: ['available', 'pending', 'sold'],
        description: 'Pet status in the store'
      }
    }
  }
};

export const userSchema: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'User Management API',
    version: '2.0.0'
  },
  paths: {},
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['id', 'username', 'email'],
        properties: {
          id: {
            type: 'string',
            format: 'uuid',
            description: 'Unique user identifier'
          },
          username: {
            type: 'string',
            pattern: '^[a-zA-Z0-9_]{3,20}$',
            description: 'Username'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address'
          },
          firstName: {
            type: 'string',
            minLength: 1,
            maxLength: 50
          },
          lastName: {
            type: 'string',
            minLength: 1,
            maxLength: 50
          },
          phone: {
            type: 'string',
            pattern: '^\\+?[1-9]\\d{1,14}$'
          },
          userStatus: {
            type: 'integer',
            format: 'int32',
            description: 'User Status',
            enum: [1, 2, 3]
          },
          isActive: {
            type: 'boolean',
            default: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          preferences: {
            $ref: '#/components/schemas/UserPreferences'
          }
        }
      },
      UserPreferences: {
        type: 'object',
        properties: {
          theme: {
            type: 'string',
            enum: ['light', 'dark', 'auto'],
            default: 'auto'
          },
          language: {
            type: 'string',
            pattern: '^[a-z]{2}(-[A-Z]{2})?$',
            default: 'en'
          },
          notifications: {
            type: 'object',
            properties: {
              email: {
                type: 'boolean',
                default: true
              },
              push: {
                type: 'boolean',
                default: false
              },
              sms: {
                type: 'boolean',
                default: false
              }
            },
            additionalProperties: false
          }
        }
      }
    }
  }
};

export const complexSchema: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Complex Types API',
    version: '1.0.0'
  },
  paths: {},
  components: {
    schemas: {
      GenericResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean'
          },
          message: {
            type: 'string'
          },
          data: {
            oneOf: [
              { type: 'string' },
              { type: 'number' },
              { type: 'object' },
              { type: 'array', items: { type: 'string' } }
            ]
          }
        }
      },
      MetadataMap: {
        type: 'object',
        additionalProperties: {
          type: 'string'
        }
      },
      StringArray: {
        type: 'array',
        items: {
          type: 'string'
        },
        minItems: 1,
        maxItems: 100,
        uniqueItems: true
      },
      NestedObject: {
        type: 'object',
        properties: {
          level1: {
            type: 'object',
            properties: {
              level2: {
                type: 'object',
                properties: {
                  level3: {
                    type: 'string'
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

export const invalidSchema = {
  // Missing openapi version
  info: {
    title: 'Invalid Schema'
  },
  paths: {}
};

export const circularRefSchema: OpenAPIV3.Document = {
  openapi: '3.0.3',
  info: {
    title: 'Circular Reference Test',
    version: '1.0.0'
  },
  paths: {},
  components: {
    schemas: {
      Node: {
        type: 'object',
        properties: {
          id: {
            type: 'string'
          },
          children: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Node'
            }
          },
          parent: {
            $ref: '#/components/schemas/Node'
          }
        }
      }
    }
  }
}; 