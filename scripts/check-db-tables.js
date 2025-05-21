const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Create a Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkDbTables() {
  console.log('Checking database tables...');

  try {
    // Check if the assignments table has the required columns
    console.log('\nChecking assignments table...');
    const { data: assignmentsColumns, error: assignmentsError } = await supabase.rpc(
      'get_column_info',
      { table_name: 'assignments' }
    );

    if (assignmentsError) {
      console.error('Error checking assignments table:', assignmentsError);
    } else {
      console.log('Assignments table columns:', assignmentsColumns);
      
      // Check for required columns
      const requiredColumns = ['assignment_id', 'course_id', 'title', 'description', 'due_date', 'course_instructor_id'];
      const missingColumns = requiredColumns.filter(col => 
        !assignmentsColumns.some(c => c.column_name === col)
      );
      
      if (missingColumns.length > 0) {
        console.error('Missing columns in assignments table:', missingColumns);
        console.log('\nSuggested SQL to fix:');
        missingColumns.forEach(col => {
          if (col === 'course_instructor_id') {
            console.log(`ALTER TABLE assignments ADD COLUMN ${col} bigint REFERENCES course_instructor(id);`);
          } else if (col === 'assignment_id') {
            console.log(`ALTER TABLE assignments ADD COLUMN ${col} serial PRIMARY KEY;`);
          } else if (col === 'course_id') {
            console.log(`ALTER TABLE assignments ADD COLUMN ${col} integer REFERENCES courses(course_id);`);
          } else if (col === 'due_date') {
            console.log(`ALTER TABLE assignments ADD COLUMN ${col} timestamptz;`);
          } else {
            console.log(`ALTER TABLE assignments ADD COLUMN ${col} text;`);
          }
        });
      } else {
        console.log('✅ Assignments table has all required columns');
      }
    }

    // Check if the submissions table has the required columns
    console.log('\nChecking submissions table...');
    const { data: submissionsColumns, error: submissionsError } = await supabase.rpc(
      'get_column_info',
      { table_name: 'submissions' }
    );

    if (submissionsError) {
      console.error('Error checking submissions table:', submissionsError);
    } else {
      console.log('Submissions table columns:', submissionsColumns);
      
      // Check for required columns
      const requiredColumns = ['submission_id', 'assignment_id', 'student_id', 'file_url', 'grade', 'feedback', 'submitted_at'];
      const missingColumns = requiredColumns.filter(col => 
        !submissionsColumns.some(c => c.column_name === col)
      );
      
      if (missingColumns.length > 0) {
        console.error('Missing columns in submissions table:', missingColumns);
        console.log('\nSuggested SQL to fix:');
        missingColumns.forEach(col => {
          if (col === 'submission_id') {
            console.log(`ALTER TABLE submissions ADD COLUMN ${col} serial PRIMARY KEY;`);
          } else if (col === 'assignment_id') {
            console.log(`ALTER TABLE submissions ADD COLUMN ${col} integer REFERENCES assignments(assignment_id);`);
          } else if (col === 'student_id') {
            console.log(`ALTER TABLE submissions ADD COLUMN ${col} integer REFERENCES students(student_id);`);
          } else if (col === 'grade') {
            console.log(`ALTER TABLE submissions ADD COLUMN ${col} numeric;`);
          } else if (col === 'submitted_at') {
            console.log(`ALTER TABLE submissions ADD COLUMN ${col} timestamptz DEFAULT CURRENT_TIMESTAMP;`);
          } else {
            console.log(`ALTER TABLE submissions ADD COLUMN ${col} text;`);
          }
        });
      } else {
        console.log('✅ Submissions table has all required columns');
      }
    }

    // Check if course_instructor table has the required columns
    console.log('\nChecking course_instructor table...');
    const { data: courseInstructorColumns, error: courseInstructorError } = await supabase.rpc(
      'get_column_info',
      { table_name: 'course_instructor' }
    );

    if (courseInstructorError) {
      console.error('Error checking course_instructor table:', courseInstructorError);
    } else {
      console.log('Course instructor table columns:', courseInstructorColumns);
      
      // Check for required columns
      const requiredColumns = ['id', 'course_id', 'instructor_id'];
      const missingColumns = requiredColumns.filter(col => 
        !courseInstructorColumns.some(c => c.column_name === col)
      );
      
      if (missingColumns.length > 0) {
        console.error('Missing columns in course_instructor table:', missingColumns);
        console.log('\nSuggested SQL to fix:');
        missingColumns.forEach(col => {
          if (col === 'id') {
            console.log(`ALTER TABLE course_instructor ADD COLUMN ${col} bigint generated by default as identity primary key;`);
          } else if (col === 'course_id') {
            console.log(`ALTER TABLE course_instructor ADD COLUMN ${col} integer REFERENCES courses(course_id);`);
          } else if (col === 'instructor_id') {
            console.log(`ALTER TABLE course_instructor ADD COLUMN ${col} integer REFERENCES instructors(instructor_id);`);
          }
        });
      } else {
        console.log('✅ Course instructor table has all required columns');
      }
    }

    // Check sample data
    console.log('\nChecking if there are any assignments in the database...');
    const { data: assignments, error: assignmentsDataError } = await supabase
      .from('assignments')
      .select('*')
      .limit(5);

    if (assignmentsDataError) {
      console.error('Error fetching assignments data:', assignmentsDataError);
    } else {
      console.log(`Found ${assignments.length} assignments`);
      if (assignments.length > 0) {
        console.log('Sample assignment:', assignments[0]);
      }
    }

    console.log('\nChecking if there are any submissions in the database...');
    const { data: submissions, error: submissionsDataError } = await supabase
      .from('submissions')
      .select('*')
      .limit(5);

    if (submissionsDataError) {
      console.error('Error fetching submissions data:', submissionsDataError);
    } else {
      console.log(`Found ${submissions.length} submissions`);
      if (submissions.length > 0) {
        console.log('Sample submission:', submissions[0]);
      }
    }

    console.log('\nChecking if there are any course_instructor records in the database...');
    const { data: courseInstructors, error: courseInstructorDataError } = await supabase
      .from('course_instructor')
      .select('*')
      .limit(5);

    if (courseInstructorDataError) {
      console.error('Error fetching course_instructor data:', courseInstructorDataError);
    } else {
      console.log(`Found ${courseInstructors.length} course_instructor records`);
      if (courseInstructors.length > 0) {
        console.log('Sample course_instructor:', courseInstructors[0]);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkDbTables(); 