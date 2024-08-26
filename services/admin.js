const database = require('../Database/database')
const {
    hash,
    compare
} = require('bcryptjs');
const {sign} = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN;

const snapShot =`
  SELECT u.id AS user_id, u.username AS userName, 
       COUNT(p.policy_number) AS policy_count
  FROM users u
  LEFT JOIN policies p ON u.id = p.user_id
  where u.role='user'
  GROUP BY u.id ;`;
const getUsers = `select username,email,id from users where id!=?;`;
const deleteuser = `delete from users where id = ?;`;
const getOneUser = `select  username , email ,role  from users where id =?;`;
const requests = `select * from request_policy`;
const acceptReq =`INSERT INTO policies (policy_number, insured_party, coverage_type, start_date, end_date, premium_amount, status, user_id)
SELECT policy_number, insured_party, coverage_type, start_date, end_date, premium_amount, status, user_id
FROM request_policy
WHERE req_id = ?`
const rejectReq =` DELETE FROM request_policy WHERE req_id = ?;`

exports.snapShot = (req,res,next) =>{
    database.query(snapShot,(err,results)=>{
        if(err)
        {
            return res.status(500).send({
                success:false,
                message:err.message,
            });
        }
        return res.status(200).send({
            success:true,
            usersData:results,
            userCount:results.length,
        });
    })
}
exports.requests =(req,res,next) =>{
    const userName = req.user.userName;

    database.query(requests,(err,results)=>{
        if(err)
        {
            return res.status(500).send({
                success:false,
                message:err.message,
            });
        }
        return res.status(200).send({
            success:true,
            pendingRequests:results,
            userCount:results.length,
            userName:userName
        });
    })

}
exports.acceptReq = (req,res,next)=>{
    const {id} = req.body;
    database.query(acceptReq,[id],(err,results)=>{
        if(err){
            return res.status(500).send({
                success:false,
                message:err.message
            })
        }
        database.query(rejectReq,[id],(err,results)=>{
            if(err){
                return res.status(500).send({
                    success:false,
                    message:err.message
                })
            }
            return res.status(200).send({
                success:true,
                message:'Request Accepted'
                
            })
        })
    })
}
exports.rejectReq = (req,res,next)=>{
    const {id} = req.body;
        database.query(rejectReq,[id],(err,results)=>{
            if(err){
                return res.status(500).send({
                    success:false,
                    message:err.message
                })
            }
            return res.status(200).send({
                success:true,
                message:'Request Rejected'
                
            })
        })
}
exports.getUsers = (req,res,next)=>{
    const id = req.user.userId;
    database.query(getUsers,[id],(err,results)=>{
        if(err)
        {
            return res.status(500).send({
                success:false,
                message:err.message,
            });
        }
        return res.status(200).send({
            success:true,
            usersData:results,
            userCount:results.length,
        });
    })


}
exports.getOneUser =(req,res,next)=>{
    const{id} = req.params;
    database.query(getOneUser, [id], (err, results) => {
        if (err) {
            return res.status(500).send({message: err.message});
        }
        if (results.length === 0) {
            return res.status(404).json({
                messgae: "No User Found"
            });
        }
        return res.status(200).json({
            success: true,
            userData: results[0],
        });
    });

}
exports.deleteuser = (req,res,next)=>{
    const {id} = req.params;
    database.query(deleteuser,[id],(err,results)=>{
        if(err){
            return res.status(500).send({
                success:false,
                message:err.message
            })
        }
        return res.status(200).send({
            success:true,
            message:'user deleted'
            
        })
    })
}
exports.updateUser = async (req, res) => {
    const {
        id
    } = req.params;
    let edit = "update users set ";
    const {
        username,
        email,
        password,
        role,
    } = req.body;
    let values = [];
    let queries = [];
    if (username) {
        queries.push("username = ?");
        values.push(username);
    }
    if (email) {
        queries.push("email = ?");
        values.push(email);
    }
    if (role) {
        queries.push("role = ?");
        values.push(role);
    }
    if (password.length!=0) {
        const hashpwd = await hash(password,12);
        
        queries.push("password = ?");
        values.push(hashpwd);
    }
    edit += queries.join(", ");
    edit += " where id= ?;";
    values.push(id);

    database.query(edit, values, (err, results) => {
        if (err) {
            return res.status(500).send({
                success:false,
                message:err.message});
        }
        return res.status(201).send({
            success: true,
            message:'updated user success',
            policyData: {
            },
        });
    });
};

