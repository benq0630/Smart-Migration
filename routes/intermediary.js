var express = require('express');
var router = express.Router();
const xlsx = require('xlsx');
const mysql = require('mysql2');

// Create a database connection
const connection = mysql.createConnection({
    host: 'localhost', // Database host
    user: 'root', // Database username
    password: '123456', // Database password
    database: 'filter' // Database name
});

// Connect to database
connection.connect((err) => {
    if (err) {
        console.error('Connection failure: ' + err.stack);
        return;
    }
    console.log('You are connected to the database');
});
const path = require('path');

// let data=[]
//     // Build file paths using absolute paths
//     const excelFileUrl = path.join(__dirname, '../public/SmartProjectDatabase(SyntheticDatabase).csv');

//     try {
//         // Reading Excel files
//         const workbook = xlsx.readFile(excelFileUrl);

//         // Gets the first worksheet
//         const sheetName = workbook.SheetNames[0];
//         const worksheet = workbook.Sheets[sheetName];

//         // Convert the worksheet to JSON format
//         data = xlsx.utils.sheet_to_json(worksheet);

//     } catch (error) {
//         console.error('Error reading Excel file:', error);
//     }


/////////////////////////////////////////////////////////////
router.get('/search', (req, res) => {
  let { gender, years_of_experience, language, google_rating, online_review, consultation_charge, location, consultation_mode, practice_area } = req.query;
  console.log(req.query)
  // Build SQL query
  let query = 'SELECT * FROM consultants WHERE 1=1';
  const params = [];

  if (gender) {
      query += ' AND gender = ?';
      params.push(gender);
  }
  if (years_of_experience) {
    let minExperience, maxExperience;

    if (years_of_experience === 'beginner') {
        minExperience = 0;
        maxExperience = 5;
    } else if (years_of_experience === 'intermediate') {
        minExperience = 6;
        maxExperience = 10;
    } else if (years_of_experience === 'Experienced') {
        minExperience = 11;
        maxExperience = 15;
    } else if (years_of_experience === 'advanced') {
      minExperience = 16;
      maxExperience = 20;
    } else if (years_of_experience === 'expert') {
        minExperience = 21;
        maxExperience = 30;
    } else {
        minExperience = 0;
        maxExperience = 30; // Default range
    }

    query += ' AND years_of_experience BETWEEN ? AND ?';
    params.push(minExperience, maxExperience);
  }
  if (language) {
    query += ' AND language LIKE ?';
    params.push(`%${language}%`); // Include queries using wildcards
}
  if (google_rating) {
      let minExperience, maxExperience; 

      if (google_rating === '1-2') {
          minExperience = 0;
          maxExperience = 2.5;
      } else if (google_rating === '2-3') {
          minExperience = 2.6;
          maxExperience = 3.5;
      } else if (google_rating === '3-4') {
          minExperience = 3.6;
          maxExperience = 4.5;
      } else if (google_rating === '4-5') {
        minExperience = 4.6;
        maxExperience = 5;
      }else {
          minExperience = 0;
          maxExperience = 5; // Default range
      }
  
      query += ' AND google_rating BETWEEN ? AND ?';
      params.push(minExperience, maxExperience);
  }
  if (online_review) {
      let minExperience, maxExperience; 

      if (online_review === '0-25') {
          minExperience = 0;
          maxExperience = 25;
      } else if (online_review === '26-50') {
          minExperience = 26;
          maxExperience = 50;
      } else if (online_review === '51-75') {
          minExperience = 51;
          maxExperience = 75;
      } else if (online_review === '76-100') {
        minExperience = 76;
        maxExperience =100;
      }else if (online_review === '101+') {
        minExperience = 101;
        maxExperience = 9999999;
      }else {
          minExperience = 0;
          maxExperience = 9999999; // Default range
      }
  
      query += ' AND online_review BETWEEN ? AND ?';
      params.push(minExperience, maxExperience);
  }
  if (consultation_charge) {
      let minExperience, maxExperience; 

    if (consultation_charge === 'standard') {
        minExperience = 0;
        maxExperience = 500;
    } else if (consultation_charge === 'premium') {
        minExperience = 501;
        maxExperience = 750;
    } else if (consultation_charge === 'luxury') {
        minExperience = 751;
        maxExperience = 1000;
    }else {
        minExperience = 0;
        maxExperience = 1000; // Default range
    }

    query += ' AND consultation_charge BETWEEN ? AND ?';
    params.push(minExperience, maxExperience);
  }
  if (location) {
      query += ' AND location LIKE ?';
      location=location.replace("+", " ")
      params.push(`%${location}%`);
  }
  if (consultation_mode) {
      query += ' AND consultation_mode = ?';
      consultation_mode=consultation_mode.replace("+", " ")
      params.push(consultation_mode);
  }
  if (practice_area) {
      query += ' AND practice_area  LIKE ?';
      practice_area=practice_area.replace("+", " ")
      params.push(`%${practice_area}%`);

  }
  console.log(query,params)
  // Execute query
  connection.query(query, params, (error, results) => {
      if (error) {
          return res.status(500).json({ error: 'Database query failed' });
      }
      res.json(results);
  });
});
/* GET users listing. */
// router.get('/data', function(req, res, next) {
//   res.send({ data:data });
// });
// router.post('/add', function(req, res, next) {
//   data.forEach(consultant => {
//     const sql = `INSERT INTO consultants (
//         full_name,
//         gender,
//         years_of_experience,
//         language,
//         google_rating,
//         online_review,
//         consultation_charge,
//         location,
//         consultation_mode,
//         practice_area,
//         marn,
//         website
//     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

//     const values = [
//         consultant.Full_name,
//         consultant.Gender,
//         consultant['Years of experience'],
//         consultant.Language,
//         consultant['Google Rating'],
//         consultant['Online Review'],
//         consultant['Consultation Charge'],
//         consultant.Location,
//         consultant['Consultation Mode'],
//         consultant['Practice Area'],
//         consultant.MARN,
//         consultant.Website
//     ];

//     // console.log(sql,values)
//     connection.query(sql, values, (err, results) => {
//         if (err) {
//             console.error('Insertion failure: ' + err.stack);
//             return;
//         }
//         console.log('Inserted successfully，ID: ' + results.insertId);
//     });
// });
// });




module.exports = router;
