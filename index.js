import express from "express"
import pg from "pg"
const app = express();
const port = 3041;
app.use(express.static('public'));

const db = new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"pgs",
    password:"admin",
    port:5432
});
const user={
present_user:"",
error:false,
err_string:"",
err:()=>{
    if(user.error){
        return user.err_string;
    }
    else{
        return false;
}
},
occ:"",
price:0
};
var type ="condo";
db.connect();
app.use(express.urlencoded({extended:true}));
app.get("/",async(req,res)=>{
    if(user.present_user){
    const result = await db.query("SELECT occupation from users where username = $1",[user.present_user]);
    
    user.occ = result.rows[0].occupation;
    console.log(user.occ);
    }

    res.render("index.ejs",{
        login:user.present_user,
        error:user.err(),
        type:type,
        occ:user.occ
    });
})
app.get("/condo",(req,res)=>{
   type = "";
   res.redirect("/");
})
app.get("/callsignup",(req,res)=>{
    res.render("signup.ejs",{
        login:user.present_user,
        occ:user.occ
    });
})
app.get("/identify",(req,res)=>{
    res.render("identify-one.ejs",{
        login:user.present_user,
        occ:user.occ
    });
})
app.get("/login",(req,res)=>{
    res.render("signin.ejs",{
        error:user.err(),
        occ:user.occ
    });
})
app.get("/contact",async(req,res)=>{
    console.log(user.present_user);
    const check = await db.query("SELECT occupation FROM users WHERE username = $1",[user.present_user]);
    console.log(check.rows);
    res.render("contact.ejs",{
        login:user.present_user,
        user:check.rows[0].occupation,
        occ:user.occ
    })
});
app.get("/story",(req,res)=>{
    res.render("story.ejs",{
        login:user.present_user,
        occ:user.occ
    });
})
app.get("/checkout",(req,res)=>{
    res.render("checkout.ejs",{
        login:user.present_user,
        occ:user.present_user
    });
})
app.post("/login",async(req,res)=>{
    console.log(req.body);
    const email_username = req.body.email;
    const password = req.body.password;
    const results=await db.query("Select true from users where email = $1 and password = $2 OR username = $1 and password = $2",[email_username,password]);
    console.log(results.rows);
    if(results.rows){
        const name =await db.query("SELECT username FROM users WHERE email=$1 or username = $1",[email_username]);
        console.log(name.rows);
        user.present_user = name.rows[0].username;
        user.error = false;
        setTimeout(function(){
            res.redirect("/");
        },1000);}
    else{
        user.error=true;
        user.err_string="Wrong username or password.Please try again.";
        res.redirect("/login");
    }
}
)
app.post("/signup",async(req,res)=>{
   const body = req.body;
   console.log(body);
   var firstname = body.firstname;
   var lastname = body.lastname;
   var username = body.username;
   var password = body.pass;
   var email = body.email;
   var isWoman = false;
   var occupation=body.user;
   if(body.check){
    isWoman = true;
   }
   if(!isWoman){
    res.redirect("/");
   }
   else{
    user.present_user=username;
    const results = await db.query("INSERT INTO users VALUES($1,$2,$3,$4)",[username,password,email,occupation]);
    if(occupation == 'renter'){
        res.redirect("/");
    }
    else{
      res.redirect("/contact");
    }
   }})
app.post("/search",(req,res)=>{
    console.log(req.body);
    if(!user.username){
        user.error = true;
        user.err_string="You haven't registered yet!The search functionality is only for registered users!";
        res.redirect("/");
    }
    else{
        res.redirect("/");
    }
})
app.post("/address",async(req,res)=>{
    console.log(req.body);
    var country = req.body.Country;
    var state = req.body.state;
    var house = req.body.house;
    var size = req.body.size;
    var amenities=req.body.amenities;
    var from_price=req.body.price[0];
    var last_price = req.body.price[1];
    var results = await db.query("SELECT * FROM locations WHERE name = $1 and price in ($2,$3)",[state,from_price,last_price]);
    console.log(results.rows);
    res.render("suggestions.ejs",{
        login:user.present_user,
        items:results.rows,
        location:results.rows[0].name,
        texts:results.rows[0].text,
        price:results.rows[0].price,
        occ:user.occ
    });
})
app.post("/submitstory",async(req,res)=>{
   console.log(req.body);
   var email = req.body.email;
   var text = req.body.text;
   const results = await db.query("INSERT INTO stories VALUES ($1,$2)",[text,email]);
res.redirect("/");
})

app.post('/homepricing',async(req,res)=>{
    console.log(req.body);
    var name = req.body.location;
    var price = req.body.price;
    var text = req.body.text;
    var time = req.body.availability;
    try{
    var results = await db.query("INSERT INTO locations VALUES($1,$2,$3,$4,$5)",[name,user.present_user,price,text,time]);
    res.redirect("/story");}
    catch{
        res.redirect("/homepricing");
    }
})
app.listen(port,(err)=>{
    if(err) throw err;
    console.log("server is running on port "+port);
})