const express = require('express');
const mysql = require('mysql');
const bcrypt = require('bcryptjs');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const validator = require('validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

// Database connection
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'ce_rental',
};

const con = mysql.createConnection(dbConfig);

con.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        process.exit(1);
    }
    console.log('Database connected successfully!');
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'"],
                scriptSrcAttr: ["'unsafe-inline'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
            },
        },
    })
);

// Serve static files
app.use('/views', express.static(path.join(__dirname, 'views')));
app.use('/student', express.static(path.join(__dirname, 'student')));
app.use('/staff', express.static(path.join(__dirname, 'staff')));
app.use('/lender', express.static(path.join(__dirname, 'lender')));
app.use('/bootstrap5', express.static(path.join(__dirname, 'bootstrap5')));
app.use('/img', express.static(path.join(__dirname, 'img')));


function isAuthenticated(req, res, next) {
    if (req.session.user) {
        console.log('User is authenticated:', req.session.user);
        return next();
    }
    console.log('User not authenticated, redirecting to login');
    return res.status(401).json({ success: false, message: 'Please log in to access this resource.' });
}

function isStudent(req, res, next) {
    if (req.session.user && req.session.user.role === 1) {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied. Students only.' });
}

function isStaff(req, res, next) {
    if (req.session.user && req.session.user.role === 2) {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied. Staff only.' });
}

function isLender(req, res, next) {
    if (req.session.user && req.session.user.role === 3) {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied. Lender only.' });
}

// General Routes
app.get('/', (req, res) => {
    if (req.session.user) {
        if (req.session.user.role === 1) return res.redirect('/student/motorcycles');
        if (req.session.user.role === 2) return res.redirect('/staff/home');
        if (req.session.user.role === 3) return res.redirect('/lender/home');
    }
    res.sendFile(path.join(__dirname, 'views/Login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views/Register.html'));
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    const checkSql = 'SELECT * FROM user WHERE u_username = ?';
    con.query(checkSql, [username], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });
        if (result.length > 0) return res.status(400).json({ success: false, message: 'Username already exists.' });
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) return res.status(500).json({ success: false, message: 'Error processing password.' });
            const insertSql = 'INSERT INTO user (u_username, u_password, u_role) VALUES (?, ?, 1)';
            con.query(insertSql, [username, hashedPassword, 1], (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error during registration.' });
                res.status(201).json({ success: true, message: 'Registration successful.' });
            });
        });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }
    const sql = 'SELECT * FROM user WHERE u_username = ?';
    con.query(sql, [username], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });
        if (result.length === 0) return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        const user = result[0];
        bcrypt.compare(password, user.u_password, (err, isMatch) => {
            if (err) return res.status(500).json({ success: false, message: 'Error during login.' });
            if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid username or password.' });
            req.session.user = {
                userId: user.u_id,
                username: user.u_username,
                role: user.u_role
            };
            console.log('Login successful, session created:', req.session.user);
            res.status(200).json({ success: true, userId: user.u_id, role: user.u_role, username: user.u_username });
        });
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).json({ success: false, message: 'Failed to log out.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ success: true, message: 'Logged out successfully.' });
    });
});

app.get('/user', isAuthenticated, (req, res) => {
    console.log('User info requested:', req.session.user);
    res.status(200).json({
        success: true,
        username: req.session.user.username,
        role: req.session.user.role,
        userId: req.session.user.userId
    });
});

// Student Routes
app.get('/student/motorcycles', (req, res) => {
    res.sendFile(path.join(__dirname, 'student/Motorcycles_list.html'));
});

app.get('/student/pending-requests', isAuthenticated, isStudent, (req, res) => {
    const borrowerId = req.session.user.userId;
    const sql = `
        SELECT br.request_id, m.model AS motorcycle_name, m.img AS motorcycle_img, br.borrow_date, br.return_date, br.status
        FROM Borrowing_Requests br
        JOIN Motorcycles m ON br.motorcycle_id = m.motorcycle_id
        WHERE br.borrower_id = ? AND br.status = 'pending'
    `;
    con.query(sql, [borrowerId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        res.status(200).json({ success: true, requests: result });
    });
});

app.get('/student/history', (req, res) => {
    res.sendFile(path.join(__dirname, 'student/historystudent.html'));
});

app.get('/student/history-data', isAuthenticated, isStudent, (req, res) => {
    const borrowerId = req.session.user.userId;

    const sql = `
        SELECT 
            br.request_id,
            m.model AS motorcycle_name,
            m.img AS motorcycle_img,
            u.u_username AS borrower_name,
            br.borrow_date,
            br.return_date,
            br.status AS request_status,
            ul.u_username AS lender_username,
            us.u_username AS staff_username
        FROM borrowing_requests br
        JOIN motorcycles m ON br.motorcycle_id = m.motorcycle_id
        JOIN user u ON br.borrower_id = u.u_id
        LEFT JOIN user ul ON br.lecturer_id = ul.u_id
        LEFT JOIN user us ON br.staff_id = us.u_id
        WHERE br.borrower_id = ?
          AND br.status IN ('approved', 'disapproved', 'returned')
        ORDER BY br.borrow_date DESC
    `;

    con.query(sql, [borrowerId], (err, result) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        }
        console.log('History data for borrower', borrowerId, ':', result); // Debug log
        res.status(200).json({ success: true, history: result });
    });
});


app.get('/student/check-status/:history_id', isAuthenticated, isStudent, (req, res) => {
    const historyId = req.params.history_id;
    const borrowerId = req.session.user.userId;
    if (!validator.isInt(historyId)) return res.status(400).json({ success: false, message: 'History ID must be an integer.' });
    const sql = `
        SELECT h.history_id, m.model AS motorcycle_name, h.actual_return_date, h.status AS history_status
        FROM History h
        JOIN Motorcycles m ON h.motorcycle_id = m.motorcycle_id
        WHERE h.history_id = ? AND h.borrower_id = ?
    `;
    con.query(sql, [historyId, borrowerId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        if (result.length === 0) return res.status(404).json({ success: false, message: 'History record not found.' });
        const status = result[0].actual_return_date ? 'returned' : result[0].history_status;
        res.status(200).json({ success: true, motorcycle_name: result[0].motorcycle_name, status });
    });
});

app.get('/student/request', (req, res) => {
    res.sendFile(path.join(__dirname, 'student/studentRequest.html'));
});

app.get('/student/check', (req, res) => {
    res.sendFile(path.join(__dirname, 'student/studentCheck.html'));
});

app.post('/submit-request', isAuthenticated, isStudent, (req, res) => {
    const { motorcycle_id, borrow_date, return_date, total_price } = req.body;
    const borrower_id = req.session.user.userId;
    const status = 'pending';

    // Validate input fields
    if (!motorcycle_id || !borrow_date || !return_date || total_price === undefined) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!validator.isInt(motorcycle_id.toString()) || !validator.isFloat(total_price.toString(), { min: 0 })) {
        return res.status(400).json({ success: false, message: 'Invalid motorcycle ID or total price.' });
    }

    // Check if the student already has an active booking
    const checkActiveBookingSql = `
        SELECT COUNT(*) as active_bookings 
        FROM Borrowing_Requests 
        WHERE borrower_id = ? 
        AND status IN ('pending', 'approved', 'borrowed')
    `;
    con.query(checkActiveBookingSql, [borrower_id], (err, bookingResult) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Database error checking active bookings.' });
        }
        if (bookingResult[0].active_bookings > 0) {
            return res.status(403).json({
                success: false,
                message: 'You can only book one motorbike at a time. Please wait until your current booking is completed or cancelled.'
            });
        }

        // Check motorcycle availability
        const checkMotorcycleSql = 'SELECT status FROM Motorcycles WHERE motorcycle_id = ?';
        con.query(checkMotorcycleSql, [motorcycle_id], (err, motorcycleResult) => {
            if (err) {
                return res.status(500).json({ success: false, message: 'Database error checking motorcycle status.' });
            }
            if (motorcycleResult.length === 0) {
                return res.status(404).json({ success: false, message: 'Motorcycle not found.' });
            }
            if (motorcycleResult[0].status !== 'available') {
                return res.status(400).json({ success: false, message: 'Motorcycle is not available.' });
            }

            // Insert the new borrowing request
            const insertSql = `
                INSERT INTO Borrowing_Requests (motorcycle_id, borrower_id, borrow_date, return_date, total_price, status)
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            con.query(insertSql, [motorcycle_id, borrower_id, borrow_date, return_date, total_price, status], (err) => {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Database error during request submission.' });
                }

                // Update motorcycle status to 'pending'
                const updateSql = 'UPDATE Motorcycles SET status = ? WHERE motorcycle_id = ?';
                con.query(updateSql, [status, motorcycle_id], (err) => {
                    if (err) {
                        return res.status(500).json({ success: false, message: 'Database error updating motorcycle status.' });
                    }
                    res.status(201).json({ success: true, message: 'Borrowing request submitted successfully.' });
                });
            });
        });
    });
});

// Staff Routes
app.get('/staff/home', isAuthenticated, isStaff, (req, res) => {
    res.sendFile(path.join(__dirname, 'staff/Motorcycle_list_staff.html'));
});

app.get('/staff/motorcycles', isAuthenticated, isStaff, (req, res) => {
    const sql = 'SELECT * FROM Motorcycles';
    con.query(sql, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });
        res.status(200).json({ success: true, motorcycles: result });
    });
});

app.get('/staff/dashboard', isAuthenticated, isStaff, (req, res) => {
    res.sendFile(path.join(__dirname, 'staff/StaffDashboard.html'));
});

app.get('/staff/dashboard-data', isAuthenticated, isStaff, (req, res) => {
    const sql = 'SELECT * FROM Motorcycles';
    con.query(sql, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });
        const statusCounts = { available: 0, pending: 0, borrowed: 0, disabled: 0 };
        result.forEach(bike => {
            switch (bike.status.toLowerCase()) {
                case 'available': statusCounts.available++; break;
                case 'pending': statusCounts.pending++; break;
                case 'borrowed': statusCounts.borrowed++; break;
                case 'disabled': statusCounts.disabled++; break;
            }
        });
        res.status(200).json({ success: true, motorcycles: result, statusCounts });
    });
});

app.get('/staff/history', isAuthenticated, isStaff, (req, res) => {
    res.sendFile(path.join(__dirname, 'staff/historystaff.html'));
});

app.get('/staff/history-data', isAuthenticated, isStaff, (req, res) => {
    const sql = `
        SELECT 
            br.request_id,
            m.model AS motorcycle_name,
            m.img AS motorcycle_img,
            u.u_username AS borrower_name,
            br.borrow_date,
            br.return_date,
            br.status AS request_status,
            br.actual_return_date,
            lender.u_username AS lender_name,
            staff.u_username AS staff_name
        FROM borrowing_requests br
        JOIN motorcycles m ON br.motorcycle_id = m.motorcycle_id
        JOIN user u ON br.borrower_id = u.u_id
        LEFT JOIN user lender ON br.lecturer_id = lender.u_id
        LEFT JOIN user staff ON br.staff_id = staff.u_id
        WHERE br.status IN ('approved', 'disapproved', 'returned')
        ORDER BY br.borrow_date DESC
    `;
    con.query(sql, (err, result) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        }
        res.status(200).json({ success: true, history: result });
    });
});

app.get('/staff/manage-assets', isAuthenticated, isStaff, (req, res) => {
    res.sendFile(path.join(__dirname, 'staff/StaffEdit.html'));
});

app.get('/staff/manage-assets-data', isAuthenticated, isStaff, (req, res) => {
    const sql = 'SELECT motorcycle_id, model, img, price, register, status FROM Motorcycles';
    con.query(sql, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });
        res.status(200).json({ success: true, motorcycles: result });
    });
});

app.post('/staff/add-motorcycle', isAuthenticated, isStaff, (req, res) => {
    const { model, price, img, register, status, created_by } = req.body;
    if (!model || !price || !img || !register || !status || !created_by) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!validator.isLength(model, { min: 1, max: 100 }) || !validator.isFloat(price.toString(), { min: 0 })) {
        return res.status(400).json({ success: false, message: 'Invalid model or price.' });
    }
    const sql = 'INSERT INTO Motorcycles (model, price, img, register, status, created_by) VALUES (?, ?, ?, ?, ?, ?)';
    con.query(sql, [model, price, img, register, status, created_by], (err) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        res.status(201).json({ success: true, message: 'Motorcycle added successfully.' });
    });
});

app.put('/staff/update-motorcycle/:motorcycle_id', isAuthenticated, isStaff, (req, res) => {
    const motorcycleId = req.params.motorcycle_id;
    const { model, price, img, register } = req.body;
    if (!model || !price || !img || !register) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (!validator.isInt(motorcycleId)) return res.status(400).json({ success: false, message: 'Motorcycle ID must be an integer.' });
    const sql = 'UPDATE Motorcycles SET model = ?, price = ?, img = ?, register = ? WHERE motorcycle_id = ?';
    con.query(sql, [model, price, img, register, motorcycleId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Motorcycle not found.' });
        res.status(200).json({ success: true, message: 'Motorcycle updated successfully.' });
    });
});

app.put('/staff/update-motorcycle-status/:motorcycle_id', isAuthenticated, isStaff, (req, res) => {
    const motorcycleId = req.params.motorcycle_id;
    const { status } = req.body;
    if (!status) return res.status(400).json({ success: false, message: 'Status is required.' });
    if (!validator.isInt(motorcycleId)) return res.status(400).json({ success: false, message: 'Motorcycle ID must be an integer.' });
    const sql = 'UPDATE Motorcycles SET status = ? WHERE motorcycle_id = ?';
    con.query(sql, [status, motorcycleId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        if (result.affectedRows === 0) return res.status(404).json({ success: false, message: 'Motorcycle not found.' });
        res.status(200).json({ success: true, message: 'Status updated successfully.' });
    });
});

app.get('/staff/approved-requests', isAuthenticated, isStaff, (req, res) => {
    const sql = `
        SELECT br.request_id, br.motorcycle_id, m.model AS motorcycle_name, m.img AS motorcycle_img, 
               u.u_username AS borrower_name, br.status
        FROM Borrowing_Requests br
        JOIN Motorcycles m ON br.motorcycle_id = m.motorcycle_id
        JOIN user u ON br.borrower_id = u.u_id
        WHERE br.status = 'approved'
    `;
    con.query(sql, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        res.status(200).json({ success: true, requests: result });
    });
});

app.put('/staff/update-return-status/:request_id', isAuthenticated, isStaff, (req, res) => {
    const requestId = req.params.request_id;
    const { motorcycleId } = req.body;
    const staffId = req.session.user.userId; // Staff's user ID from session

    if (!motorcycleId || !validator.isInt(requestId) || !validator.isInt(motorcycleId.toString())) {
        return res.status(400).json({ success: false, message: 'Valid request ID and motorcycle ID are required.' });
    }

    con.beginTransaction((err) => {
        if (err) return res.status(500).json({ success: false, message: 'Transaction error: ' + err.message });

        const fetchSql = 'SELECT motorcycle_id FROM Borrowing_Requests WHERE request_id = ?';
        con.query(fetchSql, [requestId], (err, requestResult) => {
            if (err || requestResult.length === 0) {
                return con.rollback(() => res.status(err ? 500 : 404).json({ success: false, message: err ? 'Database error' : 'Request not found.' }));
            }

            const { motorcycle_id } = requestResult[0];
            if (parseInt(motorcycleId) !== motorcycle_id) {
                return con.rollback(() => res.status(400).json({ success: false, message: 'Motorcycle ID mismatch.' }));
            }

            const updateRequestSql = 'UPDATE Borrowing_Requests SET status = "returned", actual_return_date = NOW(), staff_id = ? WHERE request_id = ?';
            con.query(updateRequestSql, [staffId, requestId], (err) => {
                if (err) {
                    return con.rollback(() => res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage }));
                }

                const updateMotorcycleSql = 'UPDATE Motorcycles SET status = "available" WHERE motorcycle_id = ?';
                con.query(updateMotorcycleSql, [motorcycle_id], (err) => {
                    if (err) {
                        return con.rollback(() => res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage }));
                    }

                    con.commit((err) => {
                        if (err) {
                            return con.rollback(() => res.status(500).json({ success: false, message: 'Commit error: ' + err.message }));
                        }
                        res.status(200).json({ success: true, message: 'Return status updated successfully.' });
                    });
                });
            });
        });
    });
});

// Lender Routes
app.get('/lender/home', isAuthenticated, isLender, (req, res) => {
    res.sendFile(path.join(__dirname, 'lender/Motorcycle_list_lender.html'));
});

app.get('/lender/motorcycles', isAuthenticated, isLender, (req, res) => {
    const sql = 'SELECT motorcycle_id, model, img, status FROM Motorcycles';
    con.query(sql, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        res.status(200).json({ success: true, motorcycles: result });
    });
});

app.get('/lender/dashboard', isAuthenticated, isLender, (req, res) => {
    res.sendFile(path.join(__dirname, 'lender/LenderDashboard.html'));
});

app.get('/lender/dashboard-data', isAuthenticated, isLender, (req, res) => {
    const sql = 'SELECT motorcycle_id, model, img, status FROM Motorcycles';
    con.query(sql, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        const statusCounts = { available: 0, pending: 0, borrowed: 0, disabled: 0 };
        result.forEach(bike => {
            switch (bike.status.toLowerCase()) {
                case 'available': statusCounts.available++; break;
                case 'pending': statusCounts.pending++; break;
                case 'borrowed': statusCounts.borrowed++; break;
                case 'disabled': statusCounts.disabled++; break;
            }
        });
        res.status(200).json({ success: true, motorcycles: result, statusCounts });
    });
});

app.get('/lender/requests', isAuthenticated, isLender, (req, res) => {
    res.sendFile(path.join(__dirname, 'lender/LenderCheckBorrow.html'));
});

app.get('/lender/get-requests', isAuthenticated, isLender, (req, res) => {
    const sql = `
        SELECT br.request_id, m.model AS motorcycle_name, m.img AS motorcycle_img, u.u_username AS borrower_username, 
               br.borrow_date, br.return_date, br.status, br.total_price, br.motorcycle_id
        FROM Borrowing_Requests br
        JOIN Motorcycles m ON br.motorcycle_id = m.motorcycle_id
        JOIN user u ON br.borrower_id = u.u_id
        WHERE br.status = 'pending'
    `;
    con.query(sql, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        res.status(200).json({ success: true, requests: result });
    });
});

app.put('/lender/update-request/:request_id', isAuthenticated, isLender, (req, res) => {
    const requestId = req.params.request_id;
    const { status, motorcycleId } = req.body;
    const lenderId = req.session.user.userId;

    console.log('Lender approving request:', { requestId, status, motorcycleId, lenderId });

    if (!status || !motorcycleId || !validator.isInt(requestId) || !validator.isInt(motorcycleId.toString())) {
        return res.status(400).json({ success: false, message: 'Valid status and motorcycle ID are required.' });
    }

    const fetchSql = 'SELECT motorcycle_id FROM Borrowing_Requests WHERE request_id = ?';
    con.query(fetchSql, [requestId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        if (result.length === 0) return res.status(404).json({ success: false, message: 'Request not found.' });

        if (parseInt(motorcycleId) !== result[0].motorcycle_id) {
            return res.status(400).json({ success: false, message: 'Motorcycle ID does not match the request.' });
        }

        const updateRequestSql = `
            UPDATE Borrowing_Requests 
            SET status = ?, lecturer_id = ? 
            WHERE request_id = ?`;
        con.query(updateRequestSql, [status, lenderId, requestId], (err, updateResult) => {
            if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
            console.log('Update result:', updateResult); // Log the result of the update

            const newMotorcycleStatus = status === 'approved' ? 'borrowed' : 'available';
            const updateMotorcycleSql = 'UPDATE Motorcycles SET status = ? WHERE motorcycle_id = ?';
            con.query(updateMotorcycleSql, [newMotorcycleStatus, motorcycleId], (err) => {
                if (err) return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
                res.status(200).json({ success: true, message: 'Request and motorcycle status updated successfully.' });
            });
        });
    });
});

app.get('/lender/history', isAuthenticated, isLender, (req, res) => {
    res.sendFile(path.join(__dirname, 'lender/historylecturer.html'));
});

app.get('/lender/history-data', isAuthenticated, isLender, (req, res) => {
    const sql = `
        SELECT 
            br.request_id,
            m.model AS motorcycle_name,
            m.img AS motorcycle_img,
            u.u_username AS borrower_name,
            br.borrow_date,
            br.return_date,
            br.status AS request_status,
            ul.u_username AS lender_username,
            us.u_username AS staff_username
        FROM borrowing_requests br
        JOIN motorcycles m ON br.motorcycle_id = m.motorcycle_id
        JOIN user u ON br.borrower_id = u.u_id
        LEFT JOIN user ul ON br.lecturer_id = ul.u_id
        LEFT JOIN user us ON br.staff_id = us.u_id
        WHERE br.status IN ('approved', 'disapproved', 'returned')
        ORDER BY br.borrow_date DESC
    `;
    con.query(sql, (err, result) => {
        if (err) {
            console.error("SQL error:", err);
            return res.status(500).json({ success: false, message: 'Database error: ' + err.sqlMessage });
        }
        res.status(200).json({ success: true, history: result });
    });
});


// General Motorcycle Routes
app.get('/motorcycles', isAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM Motorcycles WHERE status IN ("available", "pending", "borrowed")';
    con.query(sql, (err, result) => {
        if (err) {
            console.error('Error fetching motorcycles:', err);
            return res.status(500).json({ success: false, message: 'Database error.' });
        }
        console.log('Fetched motorcycles:', result);
        res.status(200).json(result);
    });
});

app.get('/request', isAuthenticated, (req, res) => {
    const sql = 'SELECT * FROM Motorcycles';
    con.query(sql, (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Database error.' });
        res.status(200).json(result);
    });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'An unexpected error occurred.' });
});

// Start Server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}).on('error', (err) => {
    console.error('Failed to start server:', err);
    if (err.code === 'EADDRINUSE') console.error(`Port ${port} is already in use.`);
});