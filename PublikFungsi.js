const momentjs = require("moment-timezone");

class Variabel {
  kontentipe = 'application/x-www-form-urlencoded; charset=UTF-8';
  botTelegram = 'Token Bot Telegramnya';
}

class Kueri {
  kueri_cari_data(nama_tabel, nama_field, kondisi) {
    let sql;
    if ((nama_tabel) && (kondisi) && (kondisi)) {
      sql = 'SELECT ' + nama_field + ' FROM ' + nama_tabel + ' ' + kondisi;
      // console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
      console.log("nama_field : " + nama_field);
      console.log("kondisi : " + kondisi);
    }
    return sql;
  }
  
  kueri_cari_data_debug(nama_tabel, nama_field, kondisi) {
    let sql;
    if ((nama_tabel) && (kondisi) && (kondisi)) {
      sql = 'SELECT ' + nama_field + ' FROM ' + nama_tabel + ' ' + kondisi;
      console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
      console.log("nama_field : " + nama_field);
      console.log("kondisi : " + kondisi);
    }
    return sql;
  }
  
  kueri_simpan_data_single(nama_tabel, nama_field, value_field) {
    let sql;
    if ((nama_tabel) && (nama_field) && (value_field)) {
      sql = 'INSERT INTO ' + nama_tabel + '(' + nama_field + ') VALUES(' + value_field + ')';
      // console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
      console.log("nama_field : " + nama_field);
      console.log("value_field : " + value_field);
    }
    return sql;
  }
  
  kueri_simpan_data_single_debug(nama_tabel, nama_field, value_field) {
    let sql;
    if ((nama_tabel) && (nama_field) && (value_field)) {
      sql = 'INSERT INTO ' + nama_tabel + '(' + nama_field + ') VALUES(' + value_field + ')';
      console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
      console.log("nama_field : " + nama_field);
      console.log("value_field : " + value_field);
    }
    return sql;
  }
  
  kueri_simpan_data_single_ignore(nama_tabel, nama_field, value_field) {
    let sql;
    if ((nama_tabel.length > 0) && (nama_field.length > 0) && (value_field.length > 0)) {
      sql = 'INSERT IGNORE INTO ' + nama_tabel + '(' + nama_field + ') VALUES(' + value_field + ')';
      // console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
      console.log("nama_field : " + nama_field);
      console.log("value_field : " + value_field);
    }
    return sql;
  }
  
  kueri_simpan_data_multi(nama_tabel, nama_field, value_field) {
    let sql;
    if ((nama_tabel) && (nama_field) && (value_field)) {
      sql = 'INSERT INTO ' + nama_tabel + '(' + nama_field + ') VALUES ' + value_field + '';
      // console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      // console.log("Parameter Kueri Belum Lengkap !");
      // console.log("nama_tabel : " + nama_tabel);
      // console.log("nama_field : " + nama_field);
      // console.log("value_field : " + value_field);
    }
    return sql;
  }
  
  kueri_simpan_data_multi_debug(nama_tabel, nama_field, value_field) {
    let sql;
    if ((nama_tabel) && (nama_field) && (value_field)) {
      sql = 'INSERT INTO ' + nama_tabel + '(' + nama_field + ') VALUES ' + value_field + '';
      console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
      console.log("nama_field : " + nama_field);
      console.log("value_field : " + value_field);
    }
    return sql;
  }
  
  kueri_simpan_data_multi_duplicate(nama_tabel, nama_field, value_field, duplicatenya) {
    let sql;
    if ((nama_tabel) && (nama_field) && (value_field)) {
      sql = 'INSERT INTO ' + nama_tabel + '(' + nama_field + ') VALUES ' + value_field + ' ON DUPLICATE KEY UPDATE ' + duplicatenya;
      // console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      // console.log("Parameter Kueri Belum Lengkap !");
      // console.log("nama_tabel : " + nama_tabel);
      // console.log("nama_field : " + nama_field);
      // console.log("value_field : " + value_field);
    }
    return sql;
  }
  
  kueri_simpan_data_multi_duplicate_debug(nama_tabel, nama_field, value_field, duplicatenya) {
    let sql;
    if ((nama_tabel) && (nama_field) && (value_field)) {
      sql = 'INSERT INTO ' + nama_tabel + '(' + nama_field + ') VALUES ' + value_field + ' ON DUPLICATE KEY UPDATE ' + duplicatenya;
      console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
      console.log("nama_field : " + nama_field);
      console.log("value_field : " + value_field);
    }
    return sql;
  }
  
  //nama_tabel,nama_field,value_field,gbrBase64
  kueri_simpan_data_base64(nama_tabel, nama_field, field_base64, value_field, gbrBase64) {
    let sql;
  
    // let base64Data = req.rawBody.replace(/^data:image\/png;base64,/, "");
  
    if ((nama_tabel) && (nama_field) && (value_field) && (field_base64) && (gbrBase64)) {
      sql = 'INSERT INTO ' + nama_tabel + '(' + nama_field + ',' + field_base64 + ') VALUES(' + value_field + ',' + gbrBase64 + ')';
      // console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
      console.log("nama_field : " + nama_field);
      console.log("field_base64 : " + field_base64);
      console.log("value_field : " + value_field);
      console.log("field_base64 : " + field_base64);
    }
    return sql;
  }
  
  kueri_ubah_data(nama_tabel, nama_field, kondisi) {
    let sql;
    if ((nama_tabel) && (nama_field) && (kondisi)) {
      sql = "UPDATE " + nama_tabel + " SET " + nama_field + " WHERE " + kondisi + "";
      // console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      // console.log("Parameter Kueri Belum Lengkap !");
      // console.log("nama_tabel : " + nama_tabel);
      // console.log("kondisi : " + kondisi);
    }
    return sql;
  }
  
  kueri_ubah_data_debug(nama_tabel, nama_field, kondisi) {
    let sql;
    if ((nama_tabel) && (nama_field) && (kondisi)) {
      sql = "UPDATE " + nama_tabel + " SET " + nama_field + " WHERE " + kondisi + "";
      console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
      console.log("kondisi : " + kondisi);
    }
    return sql;
  }
  
  kueri_hapus_data(nama_tabel, kondisi) {
    let sql;
    if ((nama_tabel) && (kondisi)) {
      sql = "DELETE FROM " + nama_tabel + " WHERE " + kondisi + "";
      // console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      // console.log("Parameter Kueri Belum Lengkap !");
      // console.log("nama_tabel : " + nama_tabel);
      // console.log("kondisi : " + kondisi);
    }
    return sql;
  }
  
  kueri_hapus_data_debug(nama_tabel, kondisi) {
    let sql;
    if ((nama_tabel) && (kondisi)) {
      sql = "DELETE FROM " + nama_tabel + " WHERE " + kondisi + "";
      console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
      console.log("kondisi : " + kondisi);
    }
    return sql;
  }
  
  kosongkan_data_debug(nama_tabel) {
    let sql;
    if (nama_tabel) {
      sql = "TRUNCATE TABLE `" + nama_tabel + "`";
      console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      console.log("Parameter Kueri Belum Lengkap !");
      console.log("nama_tabel : " + nama_tabel);
    }
    return sql;
  }
  
  kosongkan_data(nama_tabel) {
    let sql;
    if (nama_tabel) {
      sql = "TRUNCATE TABLE `" + nama_tabel + "`";
      // console.log("Kueri Lengkap: \n" + sql);
    } else {
      sql = "";
      // console.log("Parameter Kueri Belum Lengkap !");
      // console.log("nama_tabel : " + nama_tabel);
    }
    return sql;
  }
}

class Fungsi {
  urlToFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function(res) { return res.arrayBuffer(); })
      .then(function(buf) { return new File([buf], filename, { type: mimeType }); })
    );
  
    /*
    Usage example:
    urltoFile('data:text/plain;base64,aGVsbG8gd29ybGQ=', 'hello.txt','text/plain')
    .then(function(file){ console.log(file);});
    */
  }
  
  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);
  
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
  
    return new File([u8arr], filename, { type: mime });
  
    /*
    var file = dataURLtoFile('data:text/plain;base64,aGVsbG8gd29ybGQ=','hello.txt');
    console.log(file);
    */
  }

  waktu_sekarang(formatnya) {
    //DDMMYYYYHH
    let tampil_sekarang = momentjs().locale("ID").tz('Asia/Jakarta').format(formatnya);
    return tampil_sekarang;
  }
}

var kuerinya = new Kueri;
var fungsinya = new Fungsi;
var variabel = new Variabel;

module.exports = {
  kontentipe: variabel.kontentipe,
  botTelegram: variabel.botTelegram,
  CariData: function(nama_tabel, nama_field, kondisi) {
    return kuerinya.kueri_cari_data(nama_tabel, nama_field, kondisi);
  },
  CariDataDebug: function(nama_tabel, nama_field, kondisi) {
    return kuerinya.kueri_cari_data_debug(nama_tabel, nama_field, kondisi);
  },
  SimpanSingle: function(nama_tabel, nama_field, value_field) {
    return kuerinya.kueri_simpan_data_single(nama_tabel, nama_field, value_field);
  },
  SimpanSingleDebug: function(nama_tabel, nama_field, value_field) {
    return kuerinya.kueri_simpan_data_single_debug(nama_tabel, nama_field, value_field);
  },
  SimpanSingleIgnore: function(nama_tabel, nama_field, value_field) {
    return kuerinya.kueri_simpan_data_single_ignore(nama_tabel, nama_field, value_field);
  },
  SimpanMulti: function(nama_tabel, nama_field, value_field) {
    return kuerinya.kueri_simpan_data_multi(nama_tabel, nama_field, value_field);
  },
  SimpanMultiDebug: function(nama_tabel, nama_field, value_field) {
    return kuerinya.kueri_simpan_data_multi_debug(nama_tabel, nama_field, value_field);
  },
  SimpanMultiDuplicate: function(nama_tabel, nama_field, value_field, duplicatenya) {
    return kuerinya.kueri_simpan_data_multi_duplicate(nama_tabel, nama_field, value_field, duplicatenya);
  },
  SimpanMultiDuplicateDebug: function(nama_tabel, nama_field, value_field, duplicatenya) {
    return kuerinya.kueri_simpan_data_multi_duplicate_debug(nama_tabel, nama_field, value_field, duplicatenya);
  },
  SimpanBase64: function(nama_tabel, nama_field, field_base64, value_field, gbrBase64) {
    return kuerinya.kueri_simpan_data_base64(nama_tabel, nama_field, field_base64, value_field, gbrBase64);
  },
  Ubah: function(nama_tabel, nama_field, kondisi) {
    return kuerinya.kueri_ubah_data(nama_tabel, nama_field, kondisi);
  },
  UbahDebug: function(nama_tabel, nama_field, kondisi) {
    return kuerinya.kueri_ubah_data_debug(nama_tabel, nama_field, kondisi);
  },
  Hapus: function(nama_tabel, kondisi) {
    return kuerinya.kueri_hapus_data(nama_tabel, kondisi);
  },
  HapusDebug: function(nama_tabel, kondisi) {
    return kuerinya.kueri_hapus_data_debug(nama_tabel, kondisi);
  },
  KosongkanData: function(nama_tabel) {
    return kuerinya.kosongkan_data(nama_tabel);
  },
  KosongkanDataDebug: function(nama_tabel) {
    return kuerinya.kosongkan_data_debug(nama_tabel);
  },
  UrlToFile: function(url, filename, mimeType) {
    return fungsinya.urlToFile(url, filename, mimeType);
  },
  DataUrlToFile: function(dataurl, filename) {
    return fungsinya.dataURLtoFile(dataurl, filename);
  },
  WaktuSekarang: function(formatnya) {
    return fungsinya.waktu_sekarang(formatnya);
  },
};