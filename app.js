//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const app = express();
const _  = require("lodash");
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect("mongodb+srv://ShaheenMohammed:Admin1234@cluster0-fpykt.mongodb.net/todolistDB",{ useUnifiedTopology: true,useNewUrlParser: true , });

const itemsSchema  ={
  name:String
};

const Item = mongoose.model("Item", itemsSchema);


const item1 = new Item({
  name:"Buy Food"
});

const item2 = new Item({
  name:"Get Lit"
});

const item3 = new Item({
  name:"get fit"
});

const itemArr = [item1,item2,item3]

const listSchema = {
  name:String,
  items:[itemsSchema]
}

const List = mongoose.model("List",listSchema)



app.get("/", function(req, res) {

  
Item.find({},(err,foundItems)=>{
  if (foundItems.length===0) {
    Item.insertMany(itemArr,(err)=>{
      if (err) {
        console.log(err);
        
      } else {
        console.log("success");

      }
    });
  } 
          res.render("list", {listTitle: "Today", newListItems: foundItems});



});

  

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  });

      if (listName==="Today") {
          item.save();
        res.redirect("/");
      } 
      
      else {
        List.findOne({name:listName},(err, foundList)=>{
          foundList.items.push(item);
            foundList.save();
              res.redirect("/"+listName);

        });
      }


});

app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName ==="Today") {
    Item.findByIdAndRemove(checkedItemId,(err)=>{
      if (err) {
        console.log(err);
        
      } else {
  
        console.log("success");
          res.redirect("/");
  
      }
    });
  } 
  
  else {
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id: checkedItemId}}},(err, foundList)=>{
        if (!err) {
          res.redirect("/" + listName); 
        }

    });

    }
});

app.get("/:customListName",(req,res)=>{
 let customListName = _.capitalize( req.params.customListName);

  List.findOne({name:customListName},(err,foundList)=>{
    if (!err) {
      if (!foundList) {
        const list = new List({
            name:customListName,
            items:itemArr
        });
        list.save();
        res.redirect("/"+customListName);
      }
      else{
          res.render("list",{listTitle:customListName,newListItems:foundList.items})
      }
      
    }
  });

});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
