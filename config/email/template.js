function verified (nama_lengkap, token) {
    return {
        html: `
            <div align="center" style="width: 100%; padding-left: 1px; padding-right: 1px; 
            background-color: #FFFFFF;">
                <div style="margin-left: 20%; margin-right: 20%; text-align: center; 
                font-family: Lato, Lucida Grande, Lucida Sans Unicode, Tahoma, Sans-Serif; font-size: 1.3em; color: rgb(85, 85, 85);">
                    Hallo ${nama_lengkap}, 
                </div>
                Silahkan verifikasi akun kamu dengan klik link berikut: <br>
                <a style="background-color: #2F77E2;
                border: none;
                color: white;
                padding: 15px 15px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                margin: 4px 2px;
                cursor: pointer;
                border-radius: 20px;"
                href="http://192.168.1.120:8000/simandesk/confirm/confirmEmail/${token}"
                target="_blank">Verifikasi</a><br>
                Jika kamu tidak melakukan registrasi, kamu bisa mengabaikan email ini. 
                Terima kasih :)
            </div>
            `
    };
}

module.exports = {
    verified
}