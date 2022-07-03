const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const ejs = require("ejs");
const _ = require("lodash");

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Admin-Himasha:Test123@cluster0.hfeq2cs.mongodb.net/blogDB");



const PostSchema = new mongoose.Schema({
  title:{
    type:String,
    unique: [true, "Please use different name, this name is already taken"]
  },
  post:String,
});

const Post = mongoose.model("Post", PostSchema);


app.get("/", (req, res) => {

  Post.find({}, (err, posts) => {
    if(!err){
        res.render("home", {startingContent: homeStartingContent, posts: posts});
    }else{
      console.log(err);
    }
  });

});


app.get("/about", (req, res) => {
  res.render("about", {aboutContent: aboutContent});
});

app.get("/contact", (req, res) => {
  res.render("contact", {contactContent: contactContent});
});



app.get("/compose", (req, res) => {
  res.render("compose", {errMessage:"noError", title:null, post:null, msg:null});
});

app.post("/compose", (req, res) => {
  const postTitle = _.upperFirst(req.body.postTitle);
  const postBody = req.body.postBody;

  const btnSubmit = req.body.submitButton;


  //publish button event,
  if(btnSubmit === "publish"){
    Post.find({}, (err, posts) => {
      if(!err){
        posts.forEach((post) => {
          if(postTitle === post.title){
            res.render("compose", {errMessage:"error", title:postTitle, post:null, msg:"⚠️ The title you entered is already taken, please add a new one."});
          }

        });

        const newPost = new Post({
          title: postTitle,
          post: postBody
        }).save((err) =>{
          if(!err){
            res.redirect("/");
          }else{
            console.log(err);
          }
        });

      }else{
        console.log(err);
      }

    });


  //search button event,
}else if (btnSubmit === "search") {

    Post.findOne({title:postTitle}).then(post =>{

        if(post){
          res.render("compose", {errMessage:"noError", title:post.title, post:post.post, msg:null});
        }else{
          res.render("compose", {errMessage:"error", title:postTitle, post:null, msg:"⚠️ Your database does not have a title like this, please enter a valid title for get better result"});
        }

    });


  }else if(btnSubmit === "update"){

    Post.findOne({title:postTitle}).then(post =>{
      if(post){
        Post.updateOne({title:post.title}, {post:postBody}, (err) =>{
            if(!err){
              res.redirect("/");
            }else{
              console.log(err);
            }
        });

      }else{
        res.render("compose", {errMessage:"error", title:postTitle, post:null, msg:"⚠️ Your database does not have a title like this, please enter a valid title for update process"});
      }


    });

  }else if(btnSubmit === "delete"){


    Post.findOne({title:postTitle}).then(post =>{
      if(post){

        Post.deleteOne({title:postTitle}, (err) =>{
          if(!err){
            res.render("compose", {errMessage:"error", title:postTitle, post:null, msg:"🚮 This activity is deleted"});
          }else{
            console.log(err);
          }
        });

      }else{
        res.render("compose", {errMessage:"error", title:postTitle, post:null, msg:"⚠️ Your database does not have a title like this, please enter a valid title for delete process"});
      }


    });

  }

});


app.get("/posts/:postName", (req, res) => {
  const requestedTitle = _.lowerCase(req.params.postName);

    Post.find({}, (err,posts) => {
      posts.forEach((post) =>{
        const storedTitle = _.lowerCase(post.title);

        if (storedTitle === requestedTitle) {
          res.render("post", {title: post.title, content: post.post});
        }

      });

    });

});




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, () => {
  console.log("Server started on port 3000");
});
