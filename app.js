//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose =require("mongoose");
const _=require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ish:test123@realmcluster.aoxck.mongodb.net/todolistDB",{ useNewUrlParser: true ,useUnifiedTopology: true, useFindAndModify: false });

const itemschema={
  name:String
};
const Item=mongoose.model("Item",itemschema);
const item1=new Item({
  name:"Welcome to your To-do list!"
});
const item2=new Item({
  name:"Click on + to add new task"
});
const item3=new Item({
  name:"<-- Click here when your task is done!"
});
const defaultitems=[item1,item2,item3];
const listshema={
  name:String,
  items:[itemschema]
}
const List=mongoose.model("List",listshema);
app.get("/", function(req, res) {

  Item.find({},function(err,founditems){
    if(founditems.length===0){
      Item.insertMany(defaultitems,function(err){
        if(err){
        console.log(err);
        }
        else{
        console.log("success");
        }
      });
      res.redirect("/");
    }
else{
  res.render("list", {listTitle: "Today", newListItems: founditems});
}
    
  });
  
});

app.get("/:custom",function(req,res){
  const custom=_.capitalize(req.params.custom);
  List.findOne({name:custom},function(err,foundlist){
      if(!err)
      { 
            if(!foundlist){
              //create a list
             // console.log("doesntexist");
              const list=new List({
                name:custom,
                items:defaultitems
              });    
              list.save();
              res.redirect("/"+custom);
            }
            else
            { //show a list
             // console.log("existt");
             res.render("list", {listTitle: foundlist.name, newListItems: foundlist.items});
            }
      }
     
  });
  //test123
 
 
});
app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listname=req.body.list;

  const item=new Item({
    name:itemname
  });
  if(listname==="Today")
  {
  item.save();
  res.redirect("/");
  }
  else{
    List.findOne({name:listname},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listname);
    })
  }
});

app.post("/delete",function(req,res){
  const checkedid=req.body.checkbox;
  const listname=req.body.listname;
  if(listname==="Today"){
  Item.findByIdAndRemove(checkedid,function(err){
    if(!err){
      console.log("deleted");
    }
  });
  }
  else{
    List.findOneAndUpdate({name:listname},{$pull:{items:{_id:checkedid}}},function(err,foundlist){
      if(!err){
        res.redirect("/"+listname);
      }
    })
  }
 
});
app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT||3000, function() {
  console.log("Server started on port 3000");
});
