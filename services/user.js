const database = require('../Database/database')
const {
    hash,
    compare
} = require('bcryptjs');
const {sign} = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;
const addNewUser = "insert into users ( username , email, role ,password ) values (?,?,?,?) ;";
const login = "select * from users where email = ?;";
const getAll = "select * from policies where user_id=?;";
const getOne = "select * from policies where policy_number = ?;";
const requestNewPolicy =
    "insert into request_policy ( policy_number , insured_party ,coverage_type , start_date , end_date  , premium_amount , status ,user_id) values (?,?,?,?,?,?,?,?) ;";

const deleteEntry = "delete from policies where policy_number = ?;";
const check =`select 'exists' as isExist 
from policies
where policy_number =?

union all

select 'exists in req' as isExist
from request_policy
where policy_number =?;
`

exports.register = async (req, res, next) => {
    const {
        username,
        email,
        password,
        role
    } = req.body;
    const data = [username, email, role];
    try {
        const hashpwd = await hash(password, 12);
        data.push(hashpwd);
        database.query(addNewUser, data, (err, results) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: err.message
                });
            }
            const userId = results.insertId;
            // const role = results.role
            return res.status(200).send({
                success: true,
                message: 'user added succesfully',
                results: results,
                userData: {
                    userId,
                    email,
                    username,
                    role
                }
            });

        })
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
exports.userLogin = async (req, res, next) => {
    const {
        email,
        password
    } = req.body;
    try {
        database.query(login, [email], async (err, results) => {
            if (err) {
                return res.status(500).send({
                    success: false,
                    message: err.message
                });
            }
            if(results.length===0)
            {
                return res.status(400).send({
                    success: false,
                    message: 'USer Doesnt exist'
                });
            }
            const isMatch = await compare(password,results[0].password);
            if(!isMatch){
              return res.status(400).send({
                success: false,
                message: 'invalid credentials'
            });
 
            }
            const token = sign({role:results[0].role, userId:results[0].id,userName:results[0].username},JWT_SECRET,{expiresIn:JWT_EXPIRES_IN});
            res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'Strict' });

            return res.status(200).send({ 
                success: true,
                message: 'user added succesfully',
                role:results[0].role,
                userData: {
                  token:token,
                  username:results[0].username,
                  userId:results[0].id,
                }
          });
      })
    } catch (error) {
        return res.status(500).send(error.message);
    }
}
exports.getAllPolicies = (req, res) => {
    const userId = req.user.userId
    const userName = req.user.userName;

    database.query(getAll,[userId] ,(err, results) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (results.length === 0) {
            return res.status(404).send({
                success: false,
                userId:userId,
                message: "No Policies Found",
            });
        }
        return res.status(200).send({
            success: true,
            policyData: results,
            userId:userId,
            userName:userName
        });
    });
};

exports.getOnePolicy = (req, res) => {
    const{policy_number} = req.params;
    database.query(getOne, [policy_number], (err, results) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        if (results.length === 0) {
            return res.status(404).json({
                messgae: "No Policy Found"
            });
        }
        return res.status(200).json({
            success: true,
            policyData: results[0],
        });
    });
};

exports.requestNew = (req, res) => {
    const {
        policy_number,
        insured_party,
        coverage_type,
        start_date,
        end_date,
        premium_amount,
        status,
        userId,
    } = req.body;
    database.query(check, [policy_number, policy_number], (err, results) => {
        if (err) {
            res.status(400).send({
                success:false,
                message:err.message
            })
        }
        if(results.length===0)
        {
            database.query(
                requestNewPolicy,
                [
                    policy_number,
                    insured_party,
                    coverage_type,
                    start_date,
                    end_date,
                    premium_amount,
                    status,
                    userId,
                ],
                (err, results) => {
                    if (err) {
                        if (err.code === 'ER_DUP_ENTRY') {
                            return res.status(400).json({
                                success: false,
                                message: 'Policy ID already exists. Please use a unique policy number.',
                            });
                        }
                        return res.status(500).send(err.message);
                    }
                    const id = results.insertId;
                    return res.status(201).send({
                        success: true,
                        message:'new policy request successful',
                        policyData: {
                            id,
                            policy_number,
                            insured_party,
                            coverage_type,
                            start_date,
                            end_date,
                            premium_amount,
                            status,
                        },
                    });
                }
            );
        }
        else{
            res.status(400).send({
                success:false,
                message:'policy number exitst'

            });
        }
    });
    
};

exports.deletePolicy = (req, res) => {
    const {
        policy_number
    } = req.params;

    database.query(deleteEntry, [policy_number], (err, results) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        return res.status(200).send({
            success: true,
            message: "policy Deleted successfully",
        });
    });
};

exports.updatePolicy = (req, res) => {
    const {
        policy_number
    } = req.params;
    let edit = "update policies set ";
    const {
        insured_party,
        coverage_type,
        start_date,
        end_date,
        premium_amount,
        status,
    } = req.body;
    let values = [];
    let queries = [];
    if (insured_party) {
        queries.push("insured_party = ?");
        values.push(insured_party);
    }
    if (coverage_type) {
        queries.push("coverage_type = ?");
        values.push(coverage_type);
    }
    if (start_date) {
        queries.push("start_date = ?");
        values.push(start_date);
    }
    if (end_date) {
        queries.push("end_date = ?");
        values.push(end_date);
    }
    if (premium_amount) {
        queries.push("premium_amount = ?");
        values.push(premium_amount);
    }
    if (status) {
        queries.push("status = ?");
        values.push(status);
    }
    edit += queries.join(", ");
    edit += " where policy_number= ?;";
    values.push(policy_number);

    database.query(edit, values, (err, results) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        return res.status(201).send({
            success: true,
            policyData: {
                policy_number,
                insured_party,
                coverage_type,
                start_date,
                end_date,
                premium_amount,
                status,
            },
        });
    });
};

exports.logOut = (req,res)=>{
    res.clearCookie('token'); 
    return res.status(200).json({ success: true, message: 'Logout successful' });

}
