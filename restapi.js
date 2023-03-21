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
  conn = mysql.createConnection(konfigDB.dbConfig);
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
  console.log("Cek Token");
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

app.post("/api/tampil_biodata", (req, res) => {
  console.log("Tampil Biodata");
  let data = {
    token: req.body.token,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_coba';
  let nama_field = '*';
  let kondisi = 'ORDER BY kode ASC';
  try {
    sql = PublikFungsi.CariDataDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.CariDataDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
    console.log('Erorr Sistem : ' + error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
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

app.post("/api/tambah_biodata", (req, res) => {
  console.log("Tambah Biodata");
  let data = {
    token: req.body.token,
    kode : req.body.kode,
    nama : req.body.nama,
    jenis_kelamin : req.body.jenis_kelamin,
    tgl_lahir : req.body.tgl_lahir,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_coba';
  let nama_field = 'kode,nama,jenis_kelamin,tgl_lahir';
  let value_field = '"' + data.kode + '",';
  value_field += '"' + data.nama + '",';
  value_field += '"' + data.jenis_kelamin + '",';
  value_field += '"' + data.tgl_lahir + '"';

  try {
    sql = PublikFungsi.SimpanSingleDebug(
      nama_tabel,
      nama_field,
      value_field
    );
  } catch (error) {
    sql = PublikFungsi.SimpanSingleDebug(
      nama_tabel,
      nama_field,
      value_field
    );
    console.log('Erorr Sistem : ' + error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Tambah BioData.",
              status_tambah: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Tambah BioData Sukses.",
                status_tambah: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Tambah BioData Error.",
                status_tambah: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_tambah: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_tambah: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/ubah_biodata", (req, res) => {
  console.log("Ubah Biodata");
  let data = {
    token: req.body.token,
    kode : req.body.kode,
    nama : req.body.nama,
    jenis_kelamin : req.body.jenis_kelamin,
    tgl_lahir : req.body.tgl_lahir,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_coba';

  let nama_field = 'nama = "' + data.nama + '",';
  nama_field += 'jenis_kelamin = "' + data.jenis_kelamin + '",';
  nama_field += 'tgl_lahir = "' + data.tgl_lahir + '"';

  let kondisi = 'kode = "' + data.kode + '"';

  try {
    sql = PublikFungsi.UbahDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.UbahDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Ubah BioData.",
              status_ubah: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Ubah BioData Sukses.",
                status_ubah: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Ubah BioData Error.",
                status_ubah: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_ubah: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_ubah: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});


app.post("/api/hapus_biodata", (req, res) => {
  console.log("Hapus Biodata");
  let data = {
    token: req.body.token,
    kode : req.body.kode,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_coba';
  let kondisi = 'kode = "' + data.kode + '"';

  try {
    sql = PublikFungsi.HapusDebug(
      nama_tabel,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.HapusDebug(
      nama_tabel,
      kondisi
    );
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Hapus BioData.",
              status_hapus: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Hapus BioData Sukses.",
                status_hapus: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Hapus BioData Error.",
                status_hapus: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_hapus: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_hapus: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/tampil_datap", (req, res) => {
  console.log("Tampil Data Pendidikan");
  let data = {
    token: req.body.token,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pendidikan';
  let nama_field = '*';
  let kondisi = 'ORDER BY kd_pendidikan ASC';
  try {
    sql = PublikFungsi.CariDataDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.CariDataDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
    console.log('Erorr Sistem : ' + error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
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

app.post("/api/tambah_datap", (req, res) => {
  console.log("Tambah Data Pendidikan");
  let data = {
    token: req.body.token,
    kd_pendidikan : req.body.kd_pendidikan,
    nama_instansi : req.body.nama_instansi,
    range_tahun : req.body.range_tahun,
    jurusan : req.body.jurusan,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pendidikan';
  let nama_field = 'kd_pendidikan,nama_instansi,range_tahun,jurusan';
  let value_field = '"' + data.kd_pendidikan + '",';
  value_field += '"' + data.nama_instansi + '",';
  value_field += '"' + data.range_tahun + '",';
  value_field += '"' + data.jurusan + '"';

  try {
    sql = PublikFungsi.SimpanSingleDebug(
      nama_tabel,
      nama_field,
      value_field
    );
  } catch (error) {
    sql = PublikFungsi.SimpanSingleDebug(
      nama_tabel,
      nama_field,
      value_field
    );
    console.log('Erorr Sistem : ' + error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Tambah Data.",
              status_tambah: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Tambah Data Sukses.",
                status_tambah: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Tambah Data Error.",
                status_tambah: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_tambah: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_tambah: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/ubah_datap", (req, res) => {
  console.log("Ubah Data Pendidikan");
  let data = {
    token: req.body.token,
    kd_pendidikan : req.body.kd_pendidikan,
    nama_instansi : req.body.nama_instansi,
    range_tahun : req.body.range_tahun,
    jurusan : req.body.jurusan,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pendidikan';

  let nama_field = 'nama_instansi = "' + data.nama_instansi + '",';
  nama_field += 'range_tahun = "' + data.range_tahun + '",';
  nama_field += 'jurusan = "' + data.jurusan + '"';

  let kondisi = 'kd_pendidikan = "' + data.kd_pendidikan + '"';

  try {
    sql = PublikFungsi.UbahDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.UbahDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Ubah Data.",
              status_ubah: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Ubah Data Sukses.",
                status_ubah: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Ubah Data Error.",
                status_ubah: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_ubah: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_ubah: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/hapus_datap", (req, res) => {
  console.log("Hapus Data Pendidikan");
  let data = {
    token: req.body.token,
    kd_pendidikan : req.body.kd_pendidikan,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pendidikan';
  let kondisi = 'kd_pendidikan = "' + data.kd_pendidikan + '"';

  try {
    sql = PublikFungsi.HapusDebug(
      nama_tabel,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.HapusDebug(
      nama_tabel,
      kondisi
    );
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Hapus Data.",
              status_hapus: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Hapus Data Sukses.",
                status_hapus: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Hapus Data Error.",
                status_hapus: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_hapus: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_hapus: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/tampil_datak", (req, res) => {
  console.log("Tampil Data Pengalaman Kerja");
  let data = {
    token: req.body.token,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pengalaman_kerja';
  let nama_field = '*';
  let kondisi = 'ORDER BY kd_pengalaman ASC';
  try {
    sql = PublikFungsi.CariDataDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.CariDataDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
    console.log('Erorr Sistem : ' + error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
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

app.post("/api/tambah_datak", (req, res) => {
  console.log("Tambah Data Pengalaman Kerja");
  let data = {
    token: req.body.token,
    kd_pengalaman : req.body.kd_pengalaman,
    nama_instansi : req.body.nama_instansi,
    jabatan_terakhir : req.body.jabatan_terakhir,
    terakhir_bekerja : req.body.terakhir_bekerja,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pengalaman_kerja';
  let nama_field = 'kd_pengalaman,nama_instansi,jabatan_terakhir,terakhir_bekerja';
  let value_field = '"' + data.kd_pengalaman + '",';
  value_field += '"' + data.nama_instansi + '",';
  value_field += '"' + data.jabatan_terakhir + '",';
  value_field += '"' + data.terakhir_bekerja + '"';

  try {
    sql = PublikFungsi.SimpanSingleDebug(
      nama_tabel,
      nama_field,
      value_field
    );
  } catch (error) {
    sql = PublikFungsi.SimpanSingleDebug(
      nama_tabel,
      nama_field,
      value_field
    );
    console.log('Erorr Sistem : ' + error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Tambah Data.",
              status_tambah: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Tambah Data Sukses.",
                status_tambah: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Tambah Data Error.",
                status_tambah: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_tambah: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_tambah: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/ubah_datak", (req, res) => {
  console.log("Ubah Data Pengalaman Kerja");
  let data = {
    token: req.body.token,
    kd_pengalaman : req.body.kd_pengalaman,
    nama_instansi : req.body.nama_instansi,
    jabatan_terakhir : req.body.jabatan_terakhir,
    terakhir_bekerja : req.body.terakhir_bekerja,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pengalaman_kerja';

  let nama_field = 'nama_instansi = "' + data.nama_instansi + '",';
  nama_field += 'jabatan_terakhir = "' + data.jabatan_terakhir + '",';
  nama_field += 'terakhir_bekerja = "' + data.terakhir_bekerja + '"';

  let kondisi = 'kd_pengalaman = "' + data.kd_pengalaman + '"';

  try {
    sql = PublikFungsi.UbahDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.UbahDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Ubah Data.",
              status_ubah: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Ubah Data Sukses.",
                status_ubah: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Ubah Data Error.",
                status_ubah: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_ubah: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_ubah: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/hapus_datak", (req, res) => {
  console.log("Hapus Data Pengalaman Kerja");
  let data = {
    token: req.body.token,
    kd_pengalaman : req.body.kd_pengalaman,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pengalaman_kerja';
  let kondisi = 'kd_pengalaman = "' + data.kd_pengalaman + '"';

  try {
    sql = PublikFungsi.HapusDebug(
      nama_tabel,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.HapusDebug(
      nama_tabel,
      kondisi
    );
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Hapus Data.",
              status_hapus: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Hapus Data Sukses.",
                status_hapus: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Hapus Data Error.",
                status_hapus: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_hapus: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_hapus: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/tampil_dataU", (req, res) => {
  console.log("Tampil Data Pengguna Database");
  let data = {
    token: req.body.token,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pengguna';
  let nama_field = '*';
  let kondisi = 'ORDER BY nm_pengguna ASC';
  try {
    sql = PublikFungsi.CariDataDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.CariDataDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
    console.log('Erorr Sistem : ' + error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
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

app.post("/api/tambah_dataU", (req, res) => {
  console.log("Tambah Data Pengguna Database");
  let data = {
    token: req.body.token,
    nm_pengguna : req.body.nm_pengguna,
    psw_pengguna : req.body.psw_pengguna,
    level_user : req.body.level_user,
	status_akun : req.body.status_akun,
    terakhir_login : req.body.terakhir_login,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pengguna';
  let nama_field = 'nm_pengguna,psw_pengguna,level_user,status_akun,terakhir_login';
  let value_field = '"' + data.nm_pengguna + '",';
  value_field += '"' + data.psw_pengguna+ '",';
  value_field += '"' + data.level_user + '",';
  value_field += '"' + data.status_akun+ '",';
  value_field += '"' + data.terakhir_login + '"';
  try {
    sql = PublikFungsi.SimpanSingleDebug(
      nama_tabel,
      nama_field,
      value_field
    );
  } catch (error) {
    sql = PublikFungsi.SimpanSingleDebug(
      nama_tabel,
      nama_field,
      value_field
    );
    console.log('Erorr Sistem : ' + error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Tambah Data.",
              status_tambah: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Tambah Data Sukses.",
                status_tambah: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Tambah Data Error.",
                status_tambah: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_tambah: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_tambah: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/ubah_dataU", (req, res) => {
  console.log("Ubah Data Pengguna Database");
  let data = {
    token: req.body.token,
    nm_pengguna : req.body.nm_pengguna,
    psw_pengguna : req.body.psw_pengguna,
    level_user : req.body.level_user,
	status_akun : req.body.status_akun,
    terakhir_login : req.body.terakhir_login,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pengguna';

  let nama_field = 'psw_pengguna = "' + data.psw_pengguna + '",';
  nama_field += 'level_user = "' + data.level_user + '",';
  nama_field += 'status_akun = "' + data.status_akun + '",';
  nama_field += 'terakhir_login = "' + data.terakhir_login + '"';

  let kondisi = 'nm_pengguna = "' + data.nm_pengguna + '"';

  try {
    sql = PublikFungsi.UbahDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.UbahDebug(
      nama_tabel,
      nama_field,
      kondisi
    );
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Ubah Data.",
              status_ubah: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Ubah Data Sukses.",
                status_ubah: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Ubah Data Error.",
                status_ubah: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_ubah: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_ubah: false,
        tokennyaa: data["token"],
        error: null,
        data: [],
      })
    );
  }
  console.log(data);
});

app.post("/api/hapus_dataU", (req, res) => {
  console.log("Hapus Data Pengguna Database");
  let data = {
    token: req.body.token,
    nm_pengguna : req.body.nm_pengguna,
    jam_request: PublikFungsi.WaktuSekarang("DD-MM-YYYY HH:mm:ss") + " Wib.",
  };
  let sql;
  let nama_tabel = 'tb_pengguna';
  let kondisi = 'nm_pengguna = "' + data.nm_pengguna + '"';

  try {
    sql = PublikFungsi.HapusDebug(
      nama_tabel,
      kondisi
    );
  } catch (error) {
    sql = PublikFungsi.HapusDebug(
      nama_tabel,
      kondisi
    );
    console.log(error);
  }
  res.setHeader("Content-Type", "application/json");
  if (data["token"]) {
    if (Token.LoginToken(data["token"])) {
      hendelKoneksi();
      conn.query(sql, data, (err, results) => {
        if (err) {
          res.send(
            JSON.stringify({
              status: 200,
              pesan: "Error Code Hapus Data.",
              status_hapus: false,
              tokennyaa: "Hidden",
              error: err,
              data: results,
            })
          );
        } else {
          let affectedRows = results.affectedRows;
          if (affectedRows = 1) {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Hapus Data Sukses.",
                status_hapus: true,
                tokennyaa: "Hidden",
                error: null,
                data: results,
              })
            );
          } else {
            res.send(
              JSON.stringify({
                status: 200,
                pesan: "Hapus Data Error.",
                status_hapus: false,
                tokennyaa: "Hidden",
                error: null,
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
          status_hapus: false,
          tokennyaa: data["token"],
          error: null,
          data: [],
        })
      );
    }
  } else {
    res.send(
      JSON.stringify({
        status: 200,
        pesan: "Inputan Kurang !",
        status_hapus: false,
        tokennyaa: data["token"],
        error: null,
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
        apiEmail += "/api_kirim_email.php";

        var fd = 'modul=email';
        fd += '&act=kirim_email';
        fd += '&email=email yg dituju';
        fd += '&email_pengirim=email pengirim dari SMTPnya';
        fd += '&pass_pengirim=password email pengirim';
        fd += '&pass_smtp=password SMTP Email';
        fd += '&isi_email=Base64 dari HTML';

        const optionku = {
          method: 'POST',
          mode: 'cors',
          headers: {
            'Content-Type': PublikFungsi.kontentipe,
          },
          body: fd,
        }

        fetch(apiEmail, optionku)
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
                status_kirim: false,
                tokennyaa: "Hidden",
                error: err,
                data: [],
              })
            );
          });
      } else {
        res.send(
          JSON.stringify({
            status: 200,
            pesan: "Inputan Email Kurang !",
            status_kirim: false,
            tokennyaa: data.token,
            error: null,
            data: [],
          })
        );
      }
    } else {
      res.send(
        JSON.stringify({
          status: 200,
          pesan: "Tokennya Salah.",
          status_kirim: false,
          tokennyaa: data.token,
          error: null,
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
        status_kirim: false,
        tokennyaa: "Hidden",
        error: error,
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
