const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql");
const base64 = require("base-64");
const cors = require("cors");
const PublikFungsi = require("./PublikFungsi");
const Token = require("./Token");
const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const utf8 = require("utf8");
const fetch = require("node-fetch");
const tulisIniFile = require("write-ini-file");
const bacaIniFile = require("read-ini-file");
const cron = require("node-cron");

// parse application/json
// app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
// app.use(cors({ origin: true }));
app.use(cors());
app.use(express.urlencoded({
  extended:false, limit: '16gb'
}));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '16gb'
}));

//create database connection
class Konfigurasi {
  dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "coba",
  };
}
var konfigDB = new Konfigurasi;
var platformOS = process.platform;
var conn = mysql.createConnection(konfigDB.dbConfig);
const tetapAktif = () => {
  console.log("Mengaktifkan perintah selalu terhubung...");
  const sql = 'SELECT CONCAT(NOW(), " : Terhubung") AS cek';
  const data = null;
  try {
    conn.query(sql, data, (err, results) => {
      if (err) {
        console.log(err);
      } else {
        console.log(results[0].cek);
      }
    });
  } catch (error) {
    hendelKoneksi();
  }
};

//connect to database
var hendelKoneksi = function () {
  conn = mysql.createConnection(dbConfig);
  conn.connect(function onConnect(err) {
    if (err) {
      //
      console.log("Sambungan Terputus dengan pesan : " + err);
      setTimeout(() => {
        console.log("Mencoba Menyambungkan Ulang....");
        hendelKoneksi;
        console.log("MySQL/MariaDB Terhubung Kembali.");
      }, 10000);
    } else {
      console.log("MySQL/MariaDB Terhubung dengan id : " + conn.threadId);
    }
    console.log("Berjalan pada Platform : " + platformOS);
  });

  conn.on("error", function onError(err) {
    console.log("DB Error : ", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      if (platformOS === "linux") {
        exec("/opt/lampp/xampp start");
      }
      hendelKoneksi();
    } else if (err.code === "ECONNRESET") {
      hendelKoneksi();
    } else if (err.code === "ECONNREFUSED") {
      hendelKoneksi();
    } else {
      console.log("DB Error : ", err);
    }
  });
};

app.post("/api/cek_token", (req, res) => {
  console.log("Cari Data");
  let data = {
    token: req.body.token,
    hostname: req.hostname,
    ipnya: req.ip,
    jam_request: PublikFungsi.WaktuSekarang("DD MMMM YYYY HH:mm:ss") + " Wib.",
  };
  let token = data.token;
  res.setHeader("Content-Type", "application/json");
  if (token) {
    if (Token.LoginToken(token)) {
      res.send(
        JSON.stringify({
          status: 200,
          pesan: "Token Benar.",
          tokennyaa: "Hidden",
          error: null,
          jumlah_data: 1,
          data: [],
        })
      );
    }
    else{
      res.send(
        JSON.stringify({
          status: 200,
          pesan: "Tokennya Salah.",
          tokennyaa: Token.TokenRahasia(),
          error: null,
          jumlah_data: 1,
          data: [],
        })
      );
    }
  }
  else{
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Tokennya Masih Kosong!",
        tokennyaa: "Hidden",
        error: null,
        jumlah_data: 1,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/cari_data", (req, res) => {
  console.log("Cari Data");
  let data = {
    token: req.body.token,
    nama_tabel: req.body.nama_tabel,
    nama_field: req.body.nama_field,
    kondisi: req.body.kondisi,
    hostname: req.hostname,
    ipnya: req.ip,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = data["nama_tabel"];
  try {
    if (nama_tabel) {
      sql = PublikFungsi.CariDataDebug(
        base64.decode(data["nama_tabel"]),
        data["nama_field"],
        data["kondisi"]
      );
    } else {
      sql = PublikFungsi.CariDataDebug("", data["nama_field"], data["kondisi"]);
    }
  } catch (error) {
    sql = PublikFungsi.CariDataDebug("", data["nama_field"], data["kondisi"]);
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (
    data["token"] &&
    data["nama_tabel"] &&
    data["nama_field"] &&
    data["kondisi"]
  ) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error.",
              status_tampil: false,
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          if (results.length > 0) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Datanya ada.",
                status_tampil: true,
                tokennyaa: "Hidden",
                error: null,
                jumlah_data: results.length,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Belum Ada datanya.",
                status_tampil: false,
                tokennyaa: "Hidden",
                error: null,
                jumlah_data: results.length,
                data: results,
              })
            );
          }
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          pesan: "Token Tidak Sesuai !",
          status_tampil: false,
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_tampil: false,
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.put("/api/tambah_data_gbr", (req, res) => {
  let data = {
    token: req.body.token,
    nama_tabel: req.body.nama_tabel,
    nama_field: req.body.nama_field,
    value_field: req.body.value_field,
    gbr_base64: req.body.gbr_base64,
    nama_foto: req.body.nama_foto,
    alamat_foto: req.body.alamat_foto,
  };
  let sql, nama_fotonya;
  let nama_tabel = data["nama_tabel"];
  try {
    if (nama_tabel) {
      sql = PublikFungsi.SimpanSingle(
        base64.decode(data["nama_tabel"]),
        data["nama_field"],
        data["value_field"]
      );
    } else {
      sql = PublikFungsi.SimpanSingle(
        "",
        data["nama_field"],
        data["value_field"]
      );
    }
  } catch (error) {
    sql = PublikFungsi.SimpanSingle(
      "",
      data["nama_field"],
      data["value_field"]
    );
    console.log(error);
  }
  nama_fotonya = data["nama_foto"];
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          console.log("Error : " + err);
          res.send(
            JSON.stringify({
              status: 200,
              status_simpan: false,
              pesan: "Datanya Sudah Ada.",
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          if (data["gbr_base64"] && data["nama_foto"] && data["alamat_foto"]) {
            const buffer = Buffer.from(data["gbr_base64"], "base64");
            Jimp.read(buffer, (err, res_jimp) => {
              if (err) {
                console.log("Error : " + err);
                res.send(
                  JSON.stringify({
                    status: 200,
                    status_simpan: false,
                    pesan: "Data berhasil diinput tetapi error upload gambar !",
                    tokennyaa: "Hidden",
                    error: err,
                    jumlah_data: 0,
                    data: results,
                  })
                );
              } else {
                res_jimp.quality(100).write(data["alamat_foto"] + nama_fotonya);
                res.send(
                  JSON.stringify({
                    status: 200,
                    status_simpan: true,
                    pesan: "Sukses Input Data.",
                    tokennyaa: "Hidden",
                    error: null,
                    jumlah_data: results.length,
                    data: results,
                  })
                );
              }
            });
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                status_simpan: true,
                pesan: "Sukses Input Data Tanpa Gambar.",
                tokennyaa: "Hidden",
                error: null,
                jumlah_data: results.length,
                data: results,
              })
            );
          }
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_simpan: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_simpan: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.put("/api/tambah_data_gbr_2", (req, res) => {
  let data = {
    token: req.body.token,
    nama_tabel: req.body.nama_tabel,
    nama_field: req.body.nama_field,
    value_field: req.body.value_field,
    gbr_base64: req.body.gbr_base64,
    gbr_base64_2: req.body.gbr_base64_2,
    nama_foto: req.body.nama_foto,
    nama_foto_2: req.body.nama_foto_2,
    alamat_foto: req.body.alamat_foto,
    alamat_foto_2: req.body.alamat_foto_2,
  };
  let sql, nama_fotonya, nama_fotonya_2, errornya_1, errorNya_2;
  let nama_tabel = data["nama_tabel"];
  try {
    if (nama_tabel) {
      sql = PublikFungsi.SimpanSingle(
        base64.decode(data["nama_tabel"]),
        data["nama_field"],
        data["value_field"]
      );
    } else {
      sql = PublikFungsi.SimpanSingle(
        "",
        data["nama_field"],
        data["value_field"]
      );
    }
  } catch (error) {
    sql = PublikFungsi.SimpanSingle(
      "",
      data["nama_field"],
      data["value_field"]
    );
    console.log(error);
  }
  nama_fotonya = data["nama_foto"];
  nama_fotonya_2 = data["nama_foto_2"];
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          console.log("Error : " + err);
          res.send(
            JSON.stringify({
              status: 200,
              status_simpan: false,
              pesan: "Datanya Sudah Ada.",
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          if (
            data["gbr_base64"] &&
            data["gbr_base64_2"] &&
            data["nama_foto"] &&
            data["nama_foto_2"] &&
            data["alamat_foto"] &&
            data["alamat_foto_2"]
          ) {
            const buffer = Buffer.from(data["gbr_base64"], "base64");
            const buffer_2 = Buffer.from(data["gbr_base64_2"], "base64");
            Jimp.read(buffer, (err, res_jimp) => {
              if (err) {
                console.log("Error Buffer 1 : " + err);
                errornya_1 = err;
              } else {
                res_jimp.quality(100).write(data["alamat_foto"] + nama_fotonya);
                console.log("Sukses Buffer 1");
                errornya_1 = null;
              }
            });

            Jimp.read(buffer_2, (err_2, res_jimp_2) => {
              if (err) {
                console.log("Error Buffer 1 : " + err_2);
                errorNya_2 = err_2;
              } else {
                res_jimp_2
                  .quality(100)
                  .write(data["alamat_foto_2"] + nama_fotonya_2);
                console.log("Sukses Buffer 2");
                errorNya_2 = null;
              }
            });

            res.send(
              JSON.stringify({
                status: 200,
                status_simpan: true,
                pesan: "Sukses Input Data Bergambar.",
                tokennyaa: "Hidden",
                error_gbr_1: errornya_1,
                error_gbr_2: errorNya_2,
                jumlah_data: results.length,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                status_simpan: true,
                pesan: "Sukses Input Data Tanpa Gambar.",
                tokennyaa: "Hidden",
                error: null,
                jumlah_data: results.length,
                data: results,
              })
            );
          }
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_simpan: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_simpan: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/tambah_data", (req, res) => {
  let data = {
    token: req.body.token,
    nama_tabel: req.body.nama_tabel,
    nama_field: req.body.nama_field,
    value_field: req.body.value_field,
  };
  let sql;
  let nama_tabel = data["nama_tabel"];
  try {
    if (nama_tabel) {
      sql = PublikFungsi.SimpanSingleDebug(
        base64.decode(data["nama_tabel"]),
        data["nama_field"],
        data["value_field"]
      );
    } else {
      sql = PublikFungsi.SimpanSingleDebug(
        "",
        data["nama_field"],
        data["value_field"]
      );
    }
  } catch (error) {
    sql = PublikFungsi.SimpanSingleDebug(
      "",
      data["nama_field"],
      data["value_field"]
    );
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              status_simpan: false,
              pesan: "Datanya Sudah Ada.",
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              status: 200,
              status_simpan: true,
              pesan: "Sukses Input Data.",
              tokennyaa: "Hidden",
              error: null,
              jumlah_data: results.length,
              data: results,
            })
          );
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_simpan: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_simpan: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/tambah_data_multi", (req, res) => {
  let data = {
    token: req.body.token,
    nama_tabel: req.body.nama_tabel,
    nama_field: req.body.nama_field,
    value_field: req.body.value_field,
  };
  let sql;
  let nama_tabel = data["nama_tabel"];
  try {
    if (nama_tabel) {
      sql = PublikFungsi.SimpanMultiDebug(
        base64.decode(data["nama_tabel"]),
        data["nama_field"],
        data["value_field"]
      );
    } else {
      sql = PublikFungsi.SimpanMultiDebug(
        "",
        data["nama_field"],
        data["value_field"]
      );
    }
  } catch (error) {
    sql = PublikFungsi.SimpanMultiDebug(
      "",
      data["nama_field"],
      data["value_field"]
    );
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              status_simpan: false,
              pesan: "Datanya Sudah Ada.",
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              status: 200,
              status_simpan: true,
              pesan: "Sukses Input Data.",
              tokennyaa: "Hidden",
              error: null,
              jumlah_data: results.length,
              data: results,
            })
          );
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_simpan: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_simpan: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/tambah_data_multi_duplicate", (req, res) => {
  console.log("Input Multi Duplikat");
  let data = {
    token: req.body.token,
    nama_tabel: req.body.nama_tabel,
    nama_field: req.body.nama_field,
    value_field: req.body.value_field,
    field_duplicate: req.body.field_duplicate,
  };
  let sql;
  let nama_tabel = data["nama_tabel"];
  try {
    if (nama_tabel) {
      sql = PublikFungsi.SimpanMultiDuplicateDebug(
        base64.decode(data["nama_tabel"]),
        data["nama_field"],
        data["value_field"],
        data["field_duplicate"]
      );
    } else {
      sql = PublikFungsi.SimpanMultiDuplicateDebug(
        "",
        data["nama_field"],
        data["value_field"],
        data["field_duplicate"]
      );
    }
  } catch (error) {
    sql = PublikFungsi.SimpanMultiDuplicateDebug(
      "",
      data["nama_field"],
      data["value_field"],
      data["field_duplicate"]
    );
    console.log(error);
  }
  // console.log('sql : ' + sql);
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              status_simpan: false,
              pesan: "Datanya Sudah Ada.",
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              status: 200,
              status_simpan: true,
              pesan: "Sukses Input Data.",
              tokennyaa: "Hidden",
              error: null,
              jumlah_data: results.length,
              data: results,
            })
          );
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_simpan: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_simpan: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/hapus_data", (req, res) => {
  let data = {
    token: req.body.token,
    nama_tabel: req.body.nama_tabel,
    kondisi: req.body.kondisi,
    alamat_foto: req.body.alamat_foto,
    nama_foto: req.body.nama_foto,
  };
  let sql;
  let nama_tabel = data["nama_tabel"];
  try {
    if (nama_tabel) {
      sql = PublikFungsi.HapusDebug(
        base64.decode(data["nama_tabel"]),
        data["kondisi"]
      );
    } else {
      sql = PublikFungsi.HapusDebug("", data["kondisi"]);
    }
  } catch (error) {
    sql = PublikFungsi.HapusDebug("", data["kondisi"]);
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              status_hapus: false,
              pesan: "Error Hapus Data.",
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          if (data["alamat_foto"] && data["nama_foto"]) {
            if (data["alamat_foto"] && data["nama_foto"]) {
              if (fs.existsSync(data["alamat_foto"] + data["nama_foto"])) {
                fs.unlinkSync(data["alamat_foto"] + data["nama_foto"]);
              }
            }

            res.send(
              JSON.stringify({
                status: 200,
                status_hapus: true,
                pesan: "Sukses Hapus Data Beserta Fotonya.",
                tokennyaa: "Hidden",
                error: null,
                jumlah_data: results.length,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                status_hapus: true,
                pesan: "Sukses Hapus Data.",
                tokennyaa: "Hidden",
                error: null,
                jumlah_data: results.length,
                data: results,
              })
            );
          }
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_hapus: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_hapus: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/ubah_data", (req, res) => {
  let data = {
    token: req.body.token,
    nama_tabel: req.body.nama_tabel,
    nama_field: req.body.nama_field,
    kondisi: req.body.kondisi,
  };
  let sql;
  let nama_tabel = data["nama_tabel"];
  try {
    if (nama_tabel) {
      sql = PublikFungsi.UbahDebug(
        base64.decode(data["nama_tabel"]),
        data["nama_field"],
        data["kondisi"]
      );
    } else {
      sql = PublikFungsi.UbahDebug("", data["nama_field"], data["kondisi"]);
    }
  } catch (error) {
    sql = PublikFungsi.UbahDebug("", data["nama_field"], data["kondisi"]);
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              status_ubah: false,
              pesan: "Error Ubah Data.",
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              status: 200,
              status_ubah: true,
              pesan: "Sukses Ubah Data.",
              tokennyaa: "Hidden",
              error: null,
              jumlah_data: results.length,
              data: results,
            })
          );
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_ubah: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_ubah: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.put("/api/ubah_data_gbr", (req, res) => {
  let data = {
    token: req.body.token,
    nama_tabel: req.body.nama_tabel,
    nama_field: req.body.nama_field,
    kondisi: req.body.kondisi,
    gbr_base64: req.body.gbr_base64,
    alamat_foto: req.body.alamat_foto,
    nama_foto: req.body.nama_foto,
    nama_foto_lama: req.body.nama_foto_lama,
  };
  let sql;
  let nama_tabel = data["nama_tabel"];
  try {
    if (nama_tabel) {
      sql = PublikFungsi.UbahDebug(
        base64.decode(data["nama_tabel"]),
        data["nama_field"],
        data["kondisi"]
      );
    } else {
      sql = PublikFungsi.UbahDebug("", data["nama_field"], data["kondisi"]);
    }
  } catch (error) {
    sql = PublikFungsi.UbahDebug("", data["nama_field"], data["kondisi"]);
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              status_ubah: false,
              pesan: "Error Ubah Data.",
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          if (data["gbr_base64"] && data["alamat_foto"] && data["nama_foto"]) {
            const buffer = Buffer.from(data["gbr_base64"], "base64");
            Jimp.read(buffer, (err, res_jimp) => {
              if (err) {
                console.log("Error : " + err);
                res.send(
                  JSON.stringify({
                    status: 200,
                    status_ubah: false,
                    pesan: "Sukses ubah data tetapi error ubah gambar.",
                    tokennyaa: "Hidden",
                    error: null,
                    jumlah_data: 0,
                    data: results,
                  })
                );
              } else {
                if (data["alamat_foto"] && data["nama_foto_lama"]) {
                  if (
                    fs.existsSync(data["alamat_foto"] + data["nama_foto_lama"])
                  ) {
                    fs.unlinkSync(data["alamat_foto"] + data["nama_foto_lama"]);
                  }
                }

                res_jimp
                  .quality(100)
                  .write(data["alamat_foto"] + data["nama_foto"]);
                res.send(
                  JSON.stringify({
                    status: 200,
                    status_ubah: true,
                    pesan: "Sukses Ubah Data dan Ubah Gambar.",
                    tokennyaa: "Hidden",
                    error: null,
                    jumlah_data: results.length,
                    data: results,
                  })
                );
              }
            });
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                status_ubah: true,
                pesan: "Sukses Ubah Data Saja.",
                tokennyaa: "Hidden",
                error: null,
                jumlah_data: results.length,
                data: results,
              })
            );
          }
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_ubah: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_ubah: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/login_barcode", (req, res) => {
  let data = {
    token: req.body.token,
    hasil_barcode: req.body.hasil_barcode,
  };
  let sql, hasil_barcode, hasil_pisah;
  hasil_barcode = base64.decode(data["hasil_barcode"]);
  hasil_pisah = hasil_barcode.split("_");
  sql =
    'SELECT * FROM mediasoft_pengguna WHERE user_pengguna = "' +
    hasil_pisah[1] +
    '"';
  console.log(sql);
  res.setHeader("Content-Type", "application/json");
  if (data["token"] && data["hasil_barcode"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error.",
              status_tampil: false,
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          if (results.length > 0) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Datanya ada.",
                status_tampil: true,
                tokennyaa: "Hidden",
                error: null,
                jumlah_data: results.length,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Belum Ada datanya.",
                status_tampil: false,
                tokennyaa: "Hidden",
                error: null,
                jumlah_data: results.length,
                data: results,
              })
            );
          }
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          pesan: "Token Tidak Sesuai !",
          status_tampil: false,
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_tampil: false,
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/kosongkan_data", (req, res) => {
  let data = {
    token: req.body.token,
    nama_tabel: req.body.nama_tabel,
  };
  let sql;
  let nama_tabel = data["nama_tabel"];
  try {
    if (nama_tabel) {
      sql = PublikFungsi.KosongkanDataDebug(base64.decode(data["nama_tabel"]));
    } else {
      sql = PublikFungsi.KosongkanDataDebug("");
    }
  } catch (error) {
    sql = PublikFungsi.KosongkanDataDebug("");
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              status_kosongkan: false,
              pesan: "Error Kosongkan Data : " + err.message,
              tokennyaa: "Hidden",
              error: err,
              jumlah_data: 0,
              data: results,
            })
          );
        } else {
          res.send(
            JSON.stringify({
              status: 200,
              status_kosongkan: true,
              pesan: "Sukses Kosongkan Data.",
              tokennyaa: "Hidden",
              error: null,
              jumlah_data: 0,
              data: results,
            })
          );
        }
      });
      conn.end();
      console.log("Putuskan MySQL/MariaDB...");
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_kosongkan: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data["token"],
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_kosongkan: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/notif_email", (req, res) => {
  console.log("Notifikasi Email");
  let data = {
    token: req.body.token,
    email_dituju: req.body.email_dituju,
    subjek: req.body.subjek,
    isi_email: req.body.isi_email,
  };

  res.setHeader("Content-Type", "application/json");
  try {
    if (Token.LoginToken(data.token)) {
      if (data.email_dituju && data.subjek && data.isi_email) {
        var apiEmail = "https://mediasoftsolusindo.com/api";
        apiEmail += "/api_kirim_email_sitimpa.php?";
        apiEmail += "modul=email";
        apiEmail += "&act=kirim";
        apiEmail += "&email_dituju=" + data.email_dituju;
        apiEmail += "&subjek=" + data.subjek;
        apiEmail += "&isi_email=" + data.isi_email;
        apiEmail += "&token=" + Token.TokenEmail;

        fetch(apiEmail)
          .then((response) => response.json())
          .then((data_json) => {
            console.log(data_json);
            if (data_json.status) {
              res.send(
                JSON.stringify({
                  status: 200,
                  pesan: "Pesan Kirim Email : " + data_json.pesan,
                  status_kirim: data_json.status,
                  tokennyaa: "Hidden",
                  error: null,
                  jumlah_data: data_json.length,
                  data: data_json,
                })
              );
            } else {
              res.send(
                JSON.stringify({
                  status: 200,
                  pesan: "Pesan Kirim Email : " + data_json.pesan,
                  status_kirim: data_json.status,
                  tokennyaa: "Hidden",
                  error: data_json.pesan_mesin_email,
                  jumlah_data: data_json.length,
                  data: data_json,
                })
              );
            }
          })
          .catch((err) => {
            console.log("Pesan Error System : " + err);
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Pesan Email Error System : " + err,
                status_tampil: false,
                tokennyaa: "Hidden",
                error: err,
                jumlah_data: 0,
                data: [],
              })
            );
          });
      } else {
        res.send(
          JSON.stringify({
            status: 200,
            pesan: "Inputan Email Kurang !",
            status: false,
            tokennyaa: data.token,
            error: null,
            jumlah_data: 0,
            data: [],
          })
        );
      }
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          pesan: "Tokennya Salah.",
          status: false,
          tokennyaa: data.token,
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } catch (error) {
    console.log(error);
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Pesan Email Error System : " + error,
        status: false,
        tokennyaa: "Hidden",
        error: error,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/notif_telegram", (req, res) => {
  console.log("Notifikasi Telegram");
  let data = {
    token: req.body.token,
    telegram_id: req.body.telegram_id,
    message_text: req.body.message_text,
  };

  res.setHeader("Content-Type", "application/json");
  try {
    if (Token.LoginToken(data.token)) {
      if (data.message_text && data.telegram_id) {
        var apiTelegram = "https://api.telegram.org/bot";
        apiTelegram += PublikFungsi.botTelegram + "/sendMessage?";
        apiTelegram += "parse_mode=HTML";
        apiTelegram += "&chat_id=" + data.telegram_id;
        apiTelegram += "&text=" + utf8.encode(data.message_text);

        fetch(apiTelegram)
          .then((response) => response.json())
          .then((data_json) => {
            console.log(data_json);
            if (data_json.ok) {
              res.send(
                JSON.stringify({
                  status: 200,
                  pesan: "Pesan Telegram Terkirim.",
                  status: true,
                  tokennyaa: "Hidden",
                  error: null,
                  jumlah_data: data_json.length,
                  data: data_json,
                })
              );
            } else {
              res.send(
                JSON.stringify({
                  status: 200,
                  pesan: "Pesan Telegram Gagal Dikirim.",
                  status: true,
                  tokennyaa: "Hidden",
                  error: data_json,
                  jumlah_data: data_json.length,
                  data: data_json,
                })
              );
            }
          })
          .catch((err) => {
            console.log("Pesan Error System : " + err);
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Pesan Telegram Error System : " + err,
                status: false,
                tokennyaa: "Hidden",
                error: err,
                jumlah_data: 0,
                data: [],
              })
            );
          });
      } else {
        res.send(
          JSON.stringify({
            status: 200,
            pesan: "Inputan Telegram Kurang !",
            status: false,
            tokennyaa: data.token,
            error: null,
            jumlah_data: 0,
            data: [],
          })
        );
      }
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          pesan: "Tokennya Salah.",
          status: false,
          tokennyaa: data.token,
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } catch (error) {
    console.log(error);
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Pesan Telegram Error System : " + error,
        status: false,
        tokennyaa: "Hidden",
        error: error,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/set_auto_kirim_sp", (req, res) => {
  let data = {
    token: req.body.token,
    auto_kirim: req.body.auto_kirim,
    ritasi_minimal: req.body.ritasi_minimal,
    tpa: req.body.tpa,
  };
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data.token)) {
      // if (data.token) {
      const auto_kirim = data.auto_kirim;
      const ritasi_minimal = data.ritasi_minimal;
      const tpa = data.tpa;
      let pesan;
      if (!auto_kirim) {
        pesan = "Inputtan auto_kirim masih kosong !";
        res.send(
          JSON.stringify({
            status: 200,
            status_set: false,
            pesan: pesan,
            tokennyaa: "Hidden",
            error: "",
            jumlah_data: 0,
            data: [],
          })
        );
        console.log(pesan);
      } else {
        var dataini;
        var alamatfile;
        var fd;
        try {
          alamatfile = path.join(__dirname, "job_sitimpa.ini");
          dataini = bacaIniFile.sync(alamatfile);
          fd = {
            auto_sp: auto_kirim,
            ritasi_minimal: ritasi_minimal,
            tpa: tpa,
            tgl_simpan: PublikFungsi.WaktuSekarang("DD MMMM YYYY HH:mm:ss"),
            count_simpan: parseInt(dataini.count_simpan) + 1,
          };
        } catch (error) {
          fd = {
            auto_sp: auto_kirim,
            ritasi_minimal: ritasi_minimal,
            tpa: tpa,
            tgl_simpan: PublikFungsi.WaktuSekarang("DD MMMM YYYY HH:mm:ss"),
            count_simpan: 1,
          };
        }

        tulisIniFile("job_sitimpa.ini", fd)
          .then(() => {
            pesan = "Penyimpannan Job Berhasil.";
            res.send(
              JSON.stringify({
                status: 200,
                status_set: true,
                pesan: pesan,
                tokennyaa: "Hidden",
                error: "",
                jumlah_data: 0,
                data: [],
              })
            );
            console.log(pesan);

            dataini = bacaIniFile.sync(alamatfile);
            console.log(dataini);
          })
          .catch((e) => {
            pesan = "Error penyimpanan job : " + e;
            res.send(
              JSON.stringify({
                status: 200,
                status_set: false,
                pesan: pesan,
                tokennyaa: "Hidden",
                error: e,
                jumlah_data: 0,
                data: [],
              })
            );
            console.log(pesan);
          });
      }
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_set: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data.token,
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_set: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/get_auto_kirim_sp", (req, res) => {
  let data = {
    token: req.body.token,
  };
  res.setHeader("Content-Type", "application/json");
  if (!data || typeof data != "undefined") {
    if (Token.LoginToken(data.token)) {
      // if (data.token) {
      var dataini;
      var alamatfile;
      var arrDataIni = [];
      try {
        alamatfile = path.join(__dirname, "job_sitimpa.ini");
        dataini = bacaIniFile.sync(alamatfile);
        arrDataIni = [dataini];
        pesan = "Load Data Job Berhasil.";
        res.send(
          JSON.stringify({
            status: 200,
            status_get: true,
            pesan: pesan,
            tokennyaa: "Hidden",
            error: "",
            jumlah_data: arrDataIni.length,
            data: arrDataIni,
          })
        );
        console.log(pesan);
      } catch (error) {
        pesan = "Error Get Auto Kirim : " + error;
        res.send(
          JSON.stringify({
            status: 200,
            status_get: false,
            pesan: pesan,
            tokennyaa: "Hidden",
            error: "",
            jumlah_data: 0,
            data: [],
          })
        );
        console.log(pesan);
      }
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          status_get: false,
          pesan: "Token Tidak Sesuai !",
          tokennyaa: data.token,
          error: null,
          jumlah_data: 0,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        status_get: false,
        pesan: "Token Kosong !",
        tokennyaa: data["token"],
        error: null,
        jumlah_data: 0,
        data: [],
      })
    );
  }
  console.log(data);
});

app.get("/gambar", (req, res) => {
  let data = {
    path_req: req.query.path_req,
    nama_foto_req: req.query.nama_foto_req,
  };
  console.log(data);
  let alamat_path1;
  if (data["path_req"] && data["nama_foto_req"]) {
    alamat_path1 = path.join(
      __dirname + "/" + data["path_req"] + data["nama_foto_req"]
    );
  } else {
    alamat_path1 = path.join(__dirname + "/gambar/");
  }
  console.log("path : " + alamat_path1);
  res.sendFile(alamat_path1);
});

//Server listening
var host = process.env.HOT || "localhost";
var port = process.env.PORT || 81;
var server = app.listen(port, () => {
  console.log("RestApi Menggunakan Express JS. Port Server : " + port + "..." + "\n");
  console.log("Listen di http://" + host + ":" + port);
  console.log("Starting di tanggal dan waktu : " + PublikFungsi.WaktuSekarang("DD MMMM YYYY HH:mm:ss"));
});
