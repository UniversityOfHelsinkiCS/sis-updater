const { Model, STRING, DATE, ARRAY, JSONB } = require('sequelize')
const { connection } = require('../connection')

class CourseUnit extends Model {}

CourseUnit.init(
  {
    id: {
      type: STRING,
      primaryKey: true
    },
    groupId: {
      type: STRING
    },
    code: {
      type: STRING
    },
    credits: {
      type: JSONB
    },
    name: {
      type: JSONB
    },
    validityPeriod: {
      type: JSONB
    },
    gradeScaleId: {
      type: STRING
    },
    studyLevel: {
      type: STRING
    },
    courseUnitType: {
      type: STRING
    },
    possibleAttainmentLanguages: {
      type: ARRAY(STRING)
    },
    assessmentItemOrder: {
      type: ARRAY(STRING)
    },
    organisations: {
      type: JSONB
    },
    universityOrgIds: {
      type: ARRAY(STRING)
    },
    studyFields: {
      type: ARRAY(STRING)
    },
    substitutions: {
      type: JSONB
    },
    completionMethods: {
      type: JSONB
    },
    responsibilityInfos: {
      type: JSONB
    },
    createdAt: {
      type: DATE
    },
    updatedAt: {
      type: DATE
    }
  },
  {
    underscored: true,
    sequelize: connection.sequelize,
    modelName: 'course_unit',
    tableName: 'course_units',
    indexes: [
      {
        fields: ['group_id']
      }
    ]
  }
)

module.exports = CourseUnit
