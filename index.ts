import makeWASocket, { DisconnectReason, useMultiFileAuthState, } from '@whiskeysockets/baileys'
import { Boom } from '@hapi/boom'
import { WordTokenizer } from 'natural'
import axios from 'axios'

//fungsi untuk menghubungkan program ke whatsapp
async function connectToWhatsApp () {
    //fungsinya untuk mendapatkan qr kode socket whatsapp web 
    //dan menyimpan data authentikasi id socket whatsapp kedalam folder auth
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const sock = makeWASocket({
        // can provide additional config here
        printQRInTerminal: true,
        auth: state,
    })
    //sebagai penghubung program dengan whatsapp web untuk mendapatkan qr code
    sock.ev.on('creds.update', saveCreds)
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if(connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
            console.log('connection closed due to ', lastDisconnect?.error, ', reconnecting ', shouldReconnect)
            // reconnect if not logged out
            if(shouldReconnect) {
                connectToWhatsApp()
            }
        } else if(connection === 'open') {
            console.log('opened connection')
        }
    })
    //fungsi yang menerima data pesan masuk
    sock.ev.on('messages.upsert', async m => {
        console.log(JSON.stringify(m, undefined, 2))
        //menginisasi pesan
        const msg = m.messages[0];
        //fungsi yang menidentifikasi semua pesan baru yang masuk
        if (!msg.key.fromMe && m.type === 'notify') {
            //menginisiasi fitur token dari library natural
            let tokenizer = new WordTokenizer()
            //mengubah seluruh percakapan yang masuk menjadi huruf kecil semua
            const pesanmasuk = msg.message?.conversation?.toLowerCase()
            const pesanubah = String(pesanmasuk)
            //mengubah percakapan kalmiat menjadi data per kata-kata
            let nises = tokenizer.tokenize(pesanubah)
            
            //Bagian Pembukaan Chatbot

            if (nises!.includes('halo')||nises!.includes('selamat')||nises!.includes('pagi')||nises!.includes('nanya')||nises!.includes('pelayanan')||nises!.includes('tanya')||nises!.includes('tes')){
                const sentMsg  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Hai *Sobat LATIBA*, Saat ini kamu terhubung dengan akun resmi Lapas Narkotika Kelas IIB Banyuasin *(LATIBA)*. Pesan ini akan dibalas oleh Information Assitant Lapas Narkotika Banyuasin atau bisa dipanggil Intan 😊`})
                const sentMsg1  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Sobat bisa mengirimkan pesan terkait informasi layanan atau yang sesuai dengan nomor layanan dibawah ini👇`})
                const sentMsg2  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Berikut ini Informasi layanan pada Lapas Narkotika Kelas IIB Banyuasin:\n\n1. Layanan Kunjungan dan Titipan Barang\n2. Layanan Integrasi\n3. Layanan Pembinaan, Pendidikan dan Kesehatan\n4. Layanan Pengaduan\n5. Jam Pelayanan\n6. Lokasi Lapas\n\n*Info Lengkap:*\nhttps://lpnbanyuasin.kemenkumham.go.id/`})  
            }
            
            //Bagian Layanan Kunjungan
            else if(nises!.includes('1')||nises!.includes('kunjungan')||nises!.includes('titipan')||nises!.includes('barang')){
                const msgKunjung  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `*Syarat Kunjungan dan Titipan Barang* di Lapas Narkotika Kelas IIB Banyuasin:\n\n1. Membawa KTP atau KK\n2. Kartu Izin Berkunjung dari Petugas atau Surat Izin Berkunjung dari Instansi Penahan (Khusus Tahanan)\n3. Berpakaian sopan dan tidak memakai celana pendek\n4. Dilarang membawa Obat-obatan terlarang\n4. Dilarang membawa makanan yang menimbulkan penyakit atau berbau\n5. Dilarang membawa senjata api, senjata tajam, barang elektronik, dan alat komunikasi.`})
                const msgKunjung1  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `*Alur Layanan Kunjungan:*\n\n1. Pengunjung mendaftar di loket layanan\n2. Setelah mendapatkan kartu izin berkunjung, pengunjung memasuki Ruang Portir untuk dilakukan pemeriksaan oleh petugas\n3. Apabila sudah diizinkan petugas, pengunjung bersama petugas menuju ruang kunjungan\n4. Waktu berkunjung maksimal 30 Menit. Setelah selesai berkunjung, cek kembali barang pribadi yang dititipkan diloker.\n5. Selesai\n\n*Layanan ini GRATIS!!!*\n\n*Info Lengkap:* https://lpnbanyuasin.kemenkumham.go.id/`})
            }
            //Bagian Layanan Integrasi
             else if(nises!.includes('2')||nises!.includes('integrasi')||nises!.includes('pb')||nises!.includes('cb')||nises!.includes('cmb')||nises!.includes('asimilasi')){
                const msgUsulan  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `*Info Integrasi* pada Lapas Narkotika Kelas IIB Banyuasin\n\n1. Pengusulan Pembebasan Bersyarat\n2. Pengusulan Asimiliasi\n3. Pengusulan Cuti Menjelang Bebas\n4. Pengusulan Cuti Bersyarat\n\n*Info Lengkap :*\nhttps://lpnbanyuasin.kemenkumham.go.id/`})
                const msgUsulan1  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Sobat mau usulan hak integrasi untuk keluarga di dalam? 🤔\n\nSilahkan daftar data dulu yaa, Klik link dibawah ini👇\nhttps://bit.ly/LayananIntegrasiLATIBA`})
                const msgUsulan2 = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Jika sudah daftar, jangan lupa kirim pesan konfirmasi yaa 🤔\n\n Contoh : konfirmasi usulan`})
            }
            //Bagian kesehatan dan pembinaan
            else if(nises!.includes('3')||nises!.includes('kesehatan')||nises!.includes('pembinaan')||nises!.includes('pendidikan')||nises!.includes('pelatihan')||nises!.includes('program')){
                const msgPembinaan  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `*Info Layanan Pembinaan, Pendidikan dan Kesehatan* pada Lapas Narkotika Kelas IIB Banyuasin\n\n1. Rehabilitasi Sosial\n2. Pelatihan Kerja Bersertifikat\n3. PEDOSAMARWA (Perawat Dokter Berkunjung Ke Kamar Warga Binaan)\n4. Tahfiz Al-Qur'an\n5. Pendidikan Sekolah A, B dan C\n\n*Info Lengkap :*\nhttps://lpnbanyuasin.kemenkumham.go.id/`})
            }
            //bagian rehab
            else if(nises!.includes('rehab')||nises!.includes('rehabilitasi')){
                const msgRehab  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `*Syarat Layanan Rehabilitasi Sosial* di Lapas Narkotika Kelas IIB Banyuasin hanya dikhususkan *bagi Warga Binaan*.\n-------------------------\n1.Hasil Tim Asesmen\n2. Surat Keputusan Kepala Lapas untuk pelaksanaan rehabilitasi \n3. Photo Copy rekam medis yang diusulkan \n4. Seleksi Narapidana yang akan diberikan program rehabilitasi \n5. Penempatkan pada blok/lingkungan tempat Program Rehabilitasi.\n-------------------------\nPelaksanaan Rehabilitasi Sosial dilakukan bersama tim konselor dari IKAI Sumsel \n-------------------------\n*Info Lengkap :*\nhttps://lpnbanyuasin.kemenkumham.go.id/`})
            }
            //bagian konfirmasi usulan
            else if(nises!.includes('konfirmasi')&&nises!.includes('usulan')){
                axios.get(`https://script.google.com/macros/s/AKfycbz866hCzZu2rak3XP9SYlvGNBxwdj2K8GBPtL0KSKPmIjPfL3j0SKHRfSa6sHJISEg/exec?whatsapp=`+msg.key.remoteJid?.replace('@s.whatsapp.net',''))
                .then(async (response) => {
                    const {success, data, message} = response.data;
                    let str, stradmin, strbelum;
                    if (success){
                        
                        str = `*Hai Kak ${data.Nama_Penjamin}!!*\n\nKami informasikan yaa, berikut ini detail usulan integrasi kakak :\n--------------------\nNama Penjamin : ${data.Nama_Penjamin}\nHub. Keluarga : ${data.Hubungan_Keluarga}\nNama WBP : ${data.Nama_WBP}\nJenis Usulan : ${data.Jenis_Usulan}\nNo WA : ${data.Nomor_Whatsapp_Penjamin}\n--------------------\nMohon tunggu balasan petugas kami yaa kak, Terima Kasih 😊`
                        const msgUsulanPenjamin  = await sock.sendMessage(msg.key.remoteJid!, { 
                            text: str
                        })
                        const admin = '6289624026760@s.whatsapp.net'
                        stradmin = `*Halo Admin*, ada usulan nih..\n\nBerikut ini detail usulan nya:\n--------------------\nNama Penjamin : ${data.Nama_Penjamin}\nHub. Keluarga : ${data.Hubungan_Keluarga}\nNama WBP : ${data.Nama_WBP}\nJenis Usulan : ${data.Jenis_Usulan}\nNo WA : ${data.Nomor_Whatsapp_Penjamin}\n--------------------\nSegera di bantu ya min, Selamat Bekerja..\nTerima Kasih 😊`
                        const msgUsulanAdmin  = await sock.sendMessage(admin, { 
                            text: stradmin
                        })
                    }
                    else{
                        strbelum = `*Hai Sobat LATIBA*, sepertinya kakak belum daftar usulan yaa 😊\n\nSilahkan daftar data dulu yaa, Klik link dibawah ini👇\nhttps://bit.ly/LayananIntegrasiLATIBA`
                        const belumusulan  = await sock.sendMessage(msg.key.remoteJid!, { 
                            text: strbelum
                        })
                    }

                })
            }
            
            //Bagian Layanan Aduan
            else if(nises!.includes('4')||nises!.includes('aduan')||nises!.includes('pengaduan')){
                const msgAduan  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Intan Infoin yaa 😊`})
                const msgAduan1  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Apabila dalam pelayanan kami tidak sesuai pada SOP yang berlaku, Bapak/ibu bisa melaporkan hal tersebut dengan cara sebagai berikut:\n\n1. Memberikan saran pada kotak aduan yang ada di lapas\n2. Menghubungi Nomor Pengaduan 💬 +62895327189334\n3. Mengisi informasi aduan pada link berikut bit.ly/LayananPengaduanLATIBA\n\n*Data Dijamin Kerahasiaannya*`})
            }
            //Bagian Jam
            else if(nises!.includes('5')||nises!.includes('jam')||nises!.includes('waktu')){
                const msgJam  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Oke Sobat 😉`})
                const msgJam1  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Mulai  tanggal 23 Maret 2023, Waktu layanan di Lapas Narkotika Kelas IIB Banyuasin mulai dari 09:00 - 15:00 WIB.\n\n*Waktu Kunjungan*\nSenin-Kamis\nPagi : 09:00-11:30 WIB\nSiang : 13:00-14:30 WIB\n\n*Waktu Penitipan Barang*\nSenin-Kamis\nPagi : 09:00-11:30 WIB\nSiang : 13:00-14:30 WIB\n\nJum'at-Sabtu\nPagi : 09:00-11:30 WIB\n\n*Info Lengkap:*\nhttps://lpnbanyuasin.kemenkumham.go.id/`})
            }
            //Bagian Lokasi
            else if(nises!.includes('6')||nises!.includes('lokasi')){
                const msgLokasi  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Oke Sobat`})
                const msgLokasi1  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: `Untuk mengetahui lokasi Lapas Narkotika Kelas IIB Banyuasin, silahkan kunjungi lokasi berikut melalui google maps 🌎\n\n*Klik link dibawah yaa* 👇\nhttps://goo.gl/maps/CscbeP3ppPJTLn3p8`})
            }
            else {
                const sentMsg  = await sock.sendMessage(msg.key.remoteJid!, 
                    { text: '*Sobat LATIBA*\n\nMaaf yaa, Intan belum mengerti apa yang sobat maksud. Silahkan tanyakan langsung keperluan sobat ke petugas kami 😉\n\n💬 Tanya Langsung CS Kami +62895327189334'})
            }    

        
    }})
}
// run in main file
connectToWhatsApp()