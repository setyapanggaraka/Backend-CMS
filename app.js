const express = require("express");
const app = express();
const port = 3000;
const { User, Company, sequelize, Transaction } = require("./models");
const { verifyPassword } = require("./helpers/bycript");
const { generateToken, verifyToken } = require("./helpers/jwt");
const fs = require("fs");
const csv = require("fast-csv");

const { Blob } = require("buffer");
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username) throw { name: "Username is required" };
    if (!password) throw { name: "Password is required" };
    const findUser = await User.findOne({ where: { username } });
    if (!findUser) throw { name: "Invalid Username/ Password" };
    const checkPassword = verifyPassword(password, findUser.password);
    if (!checkPassword) throw { name: "Invalid Username/ Password" };
    const payload = {
      id: findUser.id,
      username: findUser.username,
    };
    const access_token = generateToken(payload);
    res.status(200).json({ access_token });
  } catch (err) {
    next(err);
  }
});

app.use(async (req, res, next) => {
  try {
    const { access_token } = req.headers;
    if (!access_token) throw { name: "Invalid Token" };
    const checkToken = verifyToken(access_token);
    const findUser = await User.findByPk(checkToken.id);
    if (!findUser) throw { name: "Invalid Token" };
    req.user = {
      id: findUser.id,
      email: findUser.email,
    };
    next();
  } catch (err) {
    next(err);
  }
});

app.post("/transactions", async (req, res, next) => {
  try {
    const { name, code, nameItem, totalItem, priceItem } = req.body;
    const result = await sequelize.transaction(async (transaction) => {
      if (!name) throw { name: "Name required" };
      if (!code) throw { name: "Code required" };
      const newCompanies = await Company.create(
        { name, code },
        { transaction }
      );
      if (!nameItem) throw { name: "NamaBarang required" };
      if (!totalItem) throw { name: "totalBarang required" };

      let remainder = await Transaction.findAll({ where: { nameItem } });
      let leftOver = 0;

      remainder.forEach((el) => {
        console.log(leftOver, ">>");
        leftOver = leftOver + el.totalItem;
      });
      console.log(leftOver + totalItem, totalItem, leftOver);
      let newTransaction = await Transaction.create(
        {
          nameItem,
          totalItem,
          CompanyId: newCompanies.id,
          priceItem,
          grandTotal: totalItem * priceItem,
          leftOver,
        },
        { transaction }
      );

      return { newCompanies, newTransaction };
    });
    const date = new Date();
    const formattedDate = date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    let newformat = formattedDate.split("/").join("-");
    const dataToExport = [
      {
        "Tanggal Input": newformat,
        "Nama Perusahaan": result.newCompanies.name,
        "Nama Barang": result.newTransaction.nameItem,
        "Total Barang": result.newTransaction.totalItem,
        "Harga Barang": result.newTransaction.priceItem,
        "Grand Total": result.newTransaction.grandTotal,
        "Sisa Barang": result.newTransaction.leftOver,
      },
    ];

    const titleKeys = Object.keys(dataToExport[0]);

    const refinedData = [];
    refinedData.push(titleKeys);

    dataToExport.forEach((item) => {
      refinedData.push(Object.values(item));
    });
    let csvContent = "";

    refinedData.forEach((row) => {
      csvContent += row.join(",") + "\n";
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8," });
    const objUrl = URL.createObjectURL(blob);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

app.get("/downloads", async (req, res) => {
  try {
    const transactions = await Transaction.findAll();
    console.log(transactions);
    const filePath = "transactions.csv";

    csv
      .writeToPath(filePath, transactions, {
        headers: true,
      })
      .on("finish", () => {
        res.download(filePath);
      });
    res.status(200).json(transactions);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
});

app.use((err, req, res, next) => {
  let code = 500;
  let message = "Internal Server Error";
  console.log(err);

  if (err.name === "Username is required") {
    code = 400;
    message = err.name;
  } else if (err.name === "Password is required") {
    code = 400;
    message = err.name;
  } else if (err.name === "Invalid Username/ Password") {
    code = 400;
    message = err.name;
  } else if (err.name === "Invalid Token" || err.name === "JsonWebTokenError") {
    code = 401;
    message = "UNAUTHORIZED";
  } else if (err.name === "Name required") {
    code = 400;
    message = "Nama Perusahaan doesn't exists";
  } else if (err.name === "Code required") {
    code = 400;
    message = "Code Perusahaan doesn't exists";
  } else if (err.name === "NamaBarang required") {
    code = 400;
    message = "Nama Barang doesn't exists";
  } else if (err.name === "totalBarang required") {
    code = 400;
    message = "Total barang doesn't exists";
  }
  res.status(code).json({ message });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
