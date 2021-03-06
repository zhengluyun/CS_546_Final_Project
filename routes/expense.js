const express = require("express");

const router = express.Router();
const expenseData = require("../data/expenses");
const userData = require("../data/users");

/* GET users listing. */
router.get("/", async function(req, res, next) {
  try {
    if(!req.session.user){
      res.render("login");
      return;
    }
    let user = req.session.user;
    let onetimeexpenses = user.expenses;
    let rexpenses = user.recurringExpenses;
    let allExpenses = [];
    for(i=0; i < onetimeexpenses.length; i++){
      let oneonetemp = await expenseData.get(onetimeexpenses[i].toString());
      allExpenses.push(oneonetemp);
    }
    for(i=0; i < rexpenses.length; i++){
      let onetemp = await expenseData.get(rexpenses[i].toString());
      allExpenses.push(onetemp);
    }
    // console.log(allExpenses);
    res.render("table", { allExpenses });
  } catch (e) {
    console.log(e);
  }
});

router.get("/addExpense", function(req, res, next) {
  res.render("addExpense");
});
router.post("/addExpense", async function(req, res, next) {
  try {
    if(!req.session.user){
      res.render("login");
      return;
    }
    const result = await expenseData.create(
      req.body.name,
      req.body.category,
      parseFloat(req.body.amount),
      req.body.comment,
      5
    );
    console.log(result);
    let usertempresult = userData.addExp(result[1].toString(), req.session.user._id.toString(), 5);
    // console.log(result);
    res.redirect("/");
  } catch (e) {
    console.log(e);
  }
});

router.get("/editExpense/:id", async function(req, res, next) {
  console.log(req.params.id);
  const expenseDetails = await expenseData.get(req.params.id);
  console.log(expenseDetails);
  res.render("editExpense", { expenseDetails });
});

router.put("/editExpense", async function(req, res, next) {
  // console.log(req.body);
  console.log(req.body.id);
  // async function update(id, nname, ncategory, namount, ncomment, nrecurring) {
  try {
    const updatedExpense = await expenseData.update(
      req.body.id,
      req.body.nname,
      req.body.ncategory,
      parseFloat(req.body.namount),
      req.body.ncomment,
      1
    );
    console.log(updatedExpense);
    res.render("table");
  } catch (e) {
    console.log(e);
  }
});

router.get("/removeExpense/:id", async function(req, res, next) {
  console.log(req.params.id);
  try{
    const resultuser = await userData.removeExp(req.params.id, req.session.user._id.toString());
    const result = await expenseData.Remove(req.params.id);
    res.render("table");
  }catch(e){
    res.status(401).render('error', {message: "invalid input, go back to listing wiht the link below"});
  }
});

module.exports = router;
