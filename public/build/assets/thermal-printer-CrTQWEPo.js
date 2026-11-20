import{n as e}from"./circle-check-BqbNOKjC.js";var t=e(`ArrowLeft`,[[`path`,{d:`m12 19-7-7 7-7`,key:`1l729n`}],[`path`,{d:`M19 12H5`,key:`x3x0zl`}]]),n=e(`Building2`,[[`path`,{d:`M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z`,key:`1b4qmf`}],[`path`,{d:`M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2`,key:`i71pzd`}],[`path`,{d:`M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2`,key:`10jefs`}],[`path`,{d:`M10 6h4`,key:`1itunk`}],[`path`,{d:`M10 10h4`,key:`tcdvrf`}],[`path`,{d:`M10 14h4`,key:`kelpxr`}],[`path`,{d:`M10 18h4`,key:`1ulq68`}]]),r=e(`Clock`,[[`circle`,{cx:`12`,cy:`12`,r:`10`,key:`1mglay`}],[`polyline`,{points:`12 6 12 12 16 14`,key:`68esgv`}]]),i=e(`Download`,[[`path`,{d:`M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4`,key:`ih7n3h`}],[`polyline`,{points:`7 10 12 15 17 10`,key:`2ggqvy`}],[`line`,{x1:`12`,x2:`12`,y1:`15`,y2:`3`,key:`1vk2je`}]]),a=e(`Printer`,[[`path`,{d:`M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2`,key:`143wyd`}],[`path`,{d:`M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6`,key:`1itne7`}],[`rect`,{x:`6`,y:`14`,width:`12`,height:`8`,rx:`1`,key:`1ue0tg`}]]);function o(e){let t=typeof e==`number`&&!isNaN(e)?e:0;return new Intl.NumberFormat(`id-ID`).format(t)}function s(e,t){if(e.length>=t)return e.substring(0,t);let n=Math.floor((t-e.length)/2),r=t-e.length-n;return` `.repeat(n)+e+` `.repeat(r)}function c(e,t,n){let r=Math.max(1,n-e.length-t.length);return e+` `.repeat(r)+t}function l(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=n.paper_width||`58mm`,i=r===`custom`,a=Number(n.receipt_columns)||(i?Number(n.custom_receipt_columns)||40:r===`80mm`?Number(n.receipt_columns_80mm)||44:Number(n.receipt_columns_58mm)||32),l=Number(n.max_item_name_length)||(a>=44?Math.min(a-12,34):a>=38?26:Math.min(a-10,22)),u=n.show_logo??!0,d=Number(n.margin_feed_lines)??2,f=`-`.repeat(a),p=`=`.repeat(a),m=[];u&&m.push(s(`*** SANUBARI ROASTERY ***`,a)),m.push(s(e.store_name.toUpperCase(),a)),e.tagline&&m.push(s(e.tagline,a)),e.address&&m.push(s(e.address,a)),e.phone&&m.push(s(`WA: ${e.phone}`,a)),m.push(p),e.is_refund&&(m.push(s(`*** BUKTI REFUND / RETUR ***`,a)),m.push(s(`DANA TELAH DIKEMBALIKAN`,a)),e.refund_reason&&m.push(c(`Alasan: ${e.refund_reason}`,``,a)),m.push(p)),m.push(c(`No: #${e.order_number}`,``,a)),m.push(c(`Tgl: ${e.date}`,`Kasir: ${e.cashier_name}`,a)),e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&m.push(c(`Pelanggan: ${e.customer_name}`,``,a)),e.customer_phone&&e.customer_phone!==`-`&&m.push(c(`Telp/WA: ${e.customer_phone}`,``,a)),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&m.push(`Alamat: ${e.customer_address}`),m.push(f);for(let t of e.items){let e=`${t.product_name} (${t.variant_label})`,n=Math.min(l,a);if(e.length<=n)m.push(e);else{let t=e;for(;t.length>0;){if(t.length<=n){m.push(t);break}let e=t.lastIndexOf(` `,n);e<=0&&(e=n),m.push(t.substring(0,e)),t=t.substring(e).trim()}}let r=`  ${t.quantity}x ${o(t.price)}`,i=o(t.subtotal);m.push(c(r,i,a))}if(m.push(f),m.push(c(`Subtotal`,`Rp ${o(e.subtotal)}`,a)),e.discount_amount>0&&m.push(c(`Diskon`,`-Rp ${o(e.discount_amount)}`,a)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;m.push(c(`Ongkir${t}`,`Rp ${o(e.shipping_cost)}`,a))}m.push(c(`TOTAL`,`Rp ${o(e.total_amount)}`,a)),m.push(f),e.is_refund&&(m.push(c(`TOTAL REFUND`,`Rp ${o(e.refund_amount||e.total_amount)}`,a)),m.push(c(`Status Kasir`,`SUDAH DI-REFUND`,a)),m.push(f)),m.push(c(`Metode Bayar`,e.payment_method_label,a)),e.cash_tendered&&e.cash_tendered>0&&(m.push(c(`Bayar Tunai`,`Rp ${o(e.cash_tendered)}`,a)),m.push(c(`Kembalian`,`Rp ${o(e.cash_change||0)}`,a))),m.push(p),e.footer_note&&e.footer_note.split(`
`).forEach(e=>m.push(s(e,a))),e.instagram&&m.push(s(`IG: ${e.instagram}`,a));for(let e=0;e<d;e++)m.push(``);return m.join(`
`)}function u(e,t=!1,n=`58mm`){let r=new TextEncoder().encode(e+`


`),i=new Uint8Array([27,64]),a=t?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),o=n===`80mm`?new Uint8Array([29,86,0]):new Uint8Array([]),s=new Uint8Array(i.length+a.length+r.length+o.length),c=0;return s.set(i,c),c+=i.length,a.length>0&&(s.set(a,c),c+=a.length),s.set(r,c),c+=r.length,o.length>0&&(s.set(o,c),c+=o.length),s}function d(e,t,n=1,r=!1,i=`58mm`,a){if(typeof window>`u`||typeof document>`u`)return;let o=window.electronAPI;if(o&&typeof o.printReceipt==`function`){(async()=>{let n=`sanubari-pos-direct-print-root`,r=`sanubari-pos-direct-print-style`,s=document.getElementById(n);s&&s.parentNode&&s.parentNode.removeChild(s);let c=document.getElementById(r);c&&c.parentNode&&c.parentNode.removeChild(c);let l=i===`custom`||a?.paper_width===`custom`,u=Math.max(30,Math.min(120,Number(a?.custom_paper_width_mm)||58)),d=Math.max(20,Math.min(u,Number(a?.custom_printable_width_mm)||u-4)),f=l?`${d}mm`:i===`80mm`?a.custom_printable_width_mm?`${a.custom_printable_width_mm}mm`:`72mm`:`48mm`,p=l?`${u}mm auto`:i===`80mm`?`80mm auto`:`58mm auto`,m=i===`80mm`||l&&u>=75?`12px`:`10.5px`,h=document.createElement(`style`);h.id=r,h.textContent=`
                @media screen {
                    #${n} {
                        display: none !important;
                    }
                }
                @media print {
                    @page {
                        size: ${p};
                        margin: 0 !important;
                    }
                    html, body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                        color: #000000 !important;
                        width: 100% !important;
                        height: auto !important;
                        min-height: 0 !important;
                        overflow: visible !important;
                    }
                    body > *:not(#${n}) {
                        display: none !important;
                    }
                    #${n} {
                        display: block !important;
                        position: static !important;
                        width: ${f} !important;
                        margin: 0 !important;
                        padding: 2mm !important;
                        box-sizing: border-box !important;
                        font-family: 'Courier New', Courier, monospace, -apple-system !important;
                        font-size: ${m} !important;
                        line-height: 1.25 !important;
                        color: #000000 !important;
                        background: #ffffff !important;
                        visibility: visible !important;
                    }
                    #${n} pre {
                        margin: 0 !important;
                        white-space: pre-wrap !important;
                        word-break: break-word !important;
                        font-family: inherit !important;
                        font-size: inherit !important;
                        color: #000000 !important;
                    }
                }
            `,document.head.appendChild(h);let g=e.match(/<body[^>]*>([\s\S]*?)<\/body>/i),_=g?g[1]:`<pre>${(t||``).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>`,v=document.createElement(`div`);v.id=n,v.innerHTML=_,document.body.appendChild(v);try{let e=a?.printer_name||a?.usb_printer_name||``;if(typeof o.getPrinters==`function`)try{let t=await o.getPrinters();if(Array.isArray(t)&&t.length>0){if(e){let n=t.find(t=>t.name&&t.name.toLowerCase()===e.toLowerCase()||t.displayName&&t.displayName.toLowerCase()===e.toLowerCase());n&&(e=n.name)}if(!e){let n=t.find(e=>e.isDefault),r=t.find(e=>/pos80|pos58|pos-|thermal|receipt|tm-t|tm-u|xprinter|eppos|vsc|blueprint|panda|iware|codesoft|rpp|mtp/i.test(`${e.name||``} ${e.displayName||``}`)),i=e=>/microsoft print to pdf|xps document writer|onenote|fax/i.test(e||``),a=t.find(e=>!i(e.name));n&&!i(n.name)?e=n.name:r?e=r.name:a?e=a.name:n&&(e=n.name)}}}catch{}await new Promise(e=>requestAnimationFrame(()=>setTimeout(e,30)));let t=l?u*1e3:i===`80mm`?8e4:58e3,n=await o.printReceipt({silent:!0,printerName:e,pageSize:{width:t,height:2e5}});(!n||!n.success)&&(n=await o.printReceipt({silent:!0,printerName:e,pageSize:`A4`})),(!n||!n.success)&&e!==``&&await o.printReceipt({silent:!0,printerName:``,pageSize:`A4`})}finally{v.parentNode&&v.parentNode.removeChild(v),h.parentNode&&h.parentNode.removeChild(h)}})();return}if(k()&&t){let e=j();if(e&&e.address)try{let a=O(u(t,r,i));window.SanubariAndroidBluetooth.printEscPosBase64(a,e.address,Math.max(1,n));return}catch{}}let s=`sanubari-pos-silent-print-frame`,c=document.getElementById(s);c&&c.parentNode&&c.parentNode.removeChild(c);let l=document.createElement(`iframe`);l.id=s,l.setAttribute(`aria-hidden`,`true`),l.style.position=`fixed`,l.style.right=`0`,l.style.bottom=`0`,l.style.width=`0`,l.style.height=`0`,l.style.border=`0`,l.style.opacity=`0`,l.style.pointerEvents=`none`,l.style.zIndex=`-1`,document.body.appendChild(l);let d=l.contentWindow,f=l.contentDocument||d?.document;if(!f||!d)return;let p=!1,m=()=>{if(!p){p=!0;try{d.focus(),d.print()}catch{}window.setTimeout(()=>{l.parentNode&&l.parentNode.removeChild(l)},3e4)}};l.onload=m,f.open(),f.write(e),f.close(),window.setTimeout(m,80)}function f(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=n.paper_width||`58mm`,i=r===`custom`,a=Math.max(30,Math.min(120,Number(n.custom_paper_width_mm)||58)),o=Math.max(20,Math.min(a,Number(n.custom_printable_width_mm)||a-4)),s=n.margin_horizontal||`2mm`,c=Math.max(1,Number(n.copies)||1),u=l(e,n),f=i?`${o}mm`:r===`80mm`?n.custom_printable_width_mm?`${n.custom_printable_width_mm}mm`:`72mm`:`48mm`,p=i?`${a}mm auto`:r===`80mm`?`80mm auto`:`58mm auto`,m=n.font_family||`monospace`,h=`'Courier New', Courier, monospace, -apple-system`;m===`courier`?h=`'Courier New', Courier, monospace`:m===`sans-serif`?h=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`:m===`consolas`?h=`'Consolas', 'Lucida Console', 'Courier New', monospace`:m===`roboto-mono`&&(h=`'Roboto Mono', monospace, 'Courier New'`);let g=n.font_size||`normal`,_=r===`80mm`||i&&a>=75?`12px`:`10.5px`;g===`compact`?_=r===`80mm`||i&&a>=75?`10.5px`:`9.5px`:g===`large`&&(_=r===`80mm`||i&&a>=75?`14px`:`12px`);let v=(n.font_weight||`normal`)===`bold`?`bold`:`normal`,y=[`SALINAN PELANGGAN`,`SALINAN KASIR / TOKO`,`SALINAN BAR / DAPUR`],b=``;for(let e=0;e<c;e++){let t=c>1?`<div style="text-align:center;font-weight:bold;font-size:10px;padding:3px 0;margin-bottom:4px;border-bottom:1px dashed #666;">[ ${y[e]||`SALINAN #${e+1}`} ]</div>`:``,n=e<c-1?`<div style="text-align:center;font-size:10px;margin:12px 0;border-top:1px dashed #999;padding-top:4px;color:#666;">- - - - - POTONG DI SINI - - - - -</div>`:``;b+=`<div class="receipt-copy">${t}<pre>${u.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre></div>${n}`}d(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Struk #${e.order_number}</title>
    <style>
        @page {
            size: ${p};
            margin: 0;
        }
        body {
            margin: 0 auto;
            padding: 2mm ${s};
            width: ${f};
            box-sizing: border-box;
            font-family: ${h};
            font-size: ${_};
            font-weight: ${v};
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: inherit;
            font-weight: inherit;
        }
        @media print {
            body {
                width: 100%;
                padding: 0 ${s};
            }
        }
    </style>
</head>
<body>
    ${b}
</body>
</html>
    `,u,c,!!n.open_cash_drawer,r,n)}function p(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=l(e,n),i=new TextEncoder().encode(r+`


`),a=new Uint8Array([27,64]),o=n.font_size===`compact`?new Uint8Array([27,77,1]):new Uint8Array([27,77,0]),s=n.font_weight===`bold`?new Uint8Array([27,69,1]):new Uint8Array([27,69,0]),c=n.open_cash_drawer?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),u=(n.paper_width||`58mm`)===`80mm`,d=n.paper_width===`custom`,f=Number(n.custom_paper_width_mm)||58,p=u||d&&f>=75?new Uint8Array([29,86,0]):new Uint8Array([]),m=a.length+o.length+s.length+c.length+i.length+p.length,h=new Uint8Array(m),g=0;return h.set(a,g),g+=a.length,h.set(o,g),g+=o.length,h.set(s,g),g+=s.length,c.length>0&&(h.set(c,g),g+=c.length),h.set(i,g),g+=i.length,p.length>0&&(h.set(p,g),g+=p.length),h}var m=`sanubari_pos_usb_printer_v1`,h=null,g=null;function _(){return typeof window<`u`&&!!window.electronAPI?.isDesktop}async function v(){if(typeof window>`u`)return[];let e=window.electronAPI;if(e&&typeof e.getPrinters==`function`)try{let t=await e.getPrinters();if(Array.isArray(t))return t.map(e=>({name:e.name||``,displayName:e.displayName||e.name||``,isDefault:!!e.isDefault,description:e.description||``,status:e.status}))}catch(e){console.warn(`Failed to get printers from electronAPI:`,e)}return[]}function y(){return typeof navigator<`u`&&`usb`in navigator&&typeof navigator.usb?.requestDevice==`function`}function b(){if(typeof window>`u`)return null;try{let e=localStorage.getItem(m);return e?JSON.parse(e):null}catch{return null}}function x(e){if(!(typeof window>`u`))try{e?localStorage.setItem(m,JSON.stringify(e)):localStorage.removeItem(m)}catch{}}async function S(){if(!y())return!1;try{let e=b();if(!e)return!1;let t=(await navigator.usb.getDevices()).find(t=>t.vendorId===e.vendorId&&t.productId===e.productId);if(!t)return!1;await t.open(),t.configuration===null&&await t.selectConfiguration(1);let n=null,r=null;if(t.configuration&&Array.isArray(t.configuration.interfaces))for(let e of t.configuration.interfaces){for(let t of e.alternates||[]){for(let i of t.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){n=e.interfaceNumber,r=i.endpointNumber;break}if(r!==null)break}if(r!==null)break}if(n!==null)try{await t.claimInterface(n)}catch{}return h=t,g=r,!0}catch{return!1}}async function C(){if(!y())throw Error(`Browser ini tidak mendukung WebUSB. Silakan gunakan Google Chrome atau Microsoft Edge di Windows.`);let e=await navigator.usb.requestDevice({filters:[]});if(!e)return null;await e.open(),e.configuration===null&&await e.selectConfiguration(1);let t=null,n=null;if(e.configuration&&Array.isArray(e.configuration.interfaces))for(let r of e.configuration.interfaces){for(let e of r.alternates||[]){for(let i of e.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){t=r.interfaceNumber,n=i.endpointNumber;break}if(n!==null)break}if(n!==null)break}if(t!==null)try{await e.claimInterface(t)}catch{}h=e,g=n;let r=`0x`+e.vendorId.toString(16).padStart(4,`0`).toUpperCase(),i=`0x`+e.productId.toString(16).padStart(4,`0`).toUpperCase(),a={name:e.productName||`Thermal USB Printer (${r}:${i})`,vendorId:e.vendorId,productId:e.productId,productName:e.productName||`Thermal POS Printer`,manufacturerName:e.manufacturerName,serialNumber:e.serialNumber,connected:!0};return x(a),a}async function w(e,t=`58mm`){let n=p(e,typeof t==`string`?{paper_width:t}:t||{});if((!h||!h.opened)&&!await S()&&!await C())return!1;if(!h)throw Error(`Printer USB tidak terhubung.`);let r=g??1;return await h.transferOut(r,n),!0}var T=`sanubari_pos_bt_printer_v1`,E=null,D=null;function O(e){let t=``,n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);return typeof window<`u`?window.btoa(t):``}function k(){if(typeof window>`u`)return!1;let e=window.SanubariAndroidBluetooth;try{return!!(e&&typeof e.isNativeAvailable==`function`&&e.isNativeAvailable())}catch{return!!e}}function A(){return typeof navigator>`u`?!1:!!navigator.bluetooth}function j(){if(typeof window>`u`)return null;if(k())try{let e=window.SanubariAndroidBluetooth.getStatus(),t=JSON.parse(e);if(t&&t.savedAddress)return{name:t.savedName||`Printer (${t.savedAddress})`,address:t.savedAddress,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}}catch{}if(E&&D)return{name:E.name||`Printer Bluetooth (Web)`,address:E.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!!E.gatt?.connected,source:`web-bluetooth`};try{let e=window.localStorage.getItem(T);if(e)return JSON.parse(e)}catch{}return null}function M(e){if(!(typeof window>`u`))try{e?window.localStorage.setItem(T,JSON.stringify(e)):window.localStorage.removeItem(T)}catch{}}function N(){if(!k())return[];try{let e=window.SanubariAndroidBluetooth.getDevices(),t=JSON.parse(e);return Array.isArray(t)?t.sort((e,t)=>e.connected&&!t.connected?-1:!e.connected&&t.connected?1:e.isPrinter&&!t.isPrinter?-1:!e.isPrinter&&t.isPrinter?1:e.bonded&&!t.bonded?-1:!e.bonded&&t.bonded?1:(e.name||``).localeCompare(t.name||``)):[]}catch{return[]}}function P(){if(!k())return!1;try{return window.SanubariAndroidBluetooth.startScan(),!0}catch{return!1}}function F(){if(k())try{window.SanubariAndroidBluetooth.stopScan()}catch{}}function I(){if(k())try{window.SanubariAndroidBluetooth.openBluetoothSettings();return}catch{}if(typeof window<`u`)try{window.location.href=`intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end`}catch{}}function L(e){return new Promise(t=>{if(!k()){t({success:!1,message:`Jembatan Bluetooth Native Android tidak tersedia.`});return}let n=!1,r=window.setTimeout(()=>{n||(n=!0,window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:`Waktu koneksi habis (timeout). Pastikan printer Bluetooth menyala dan berada di dekat perangkat.`}))},16e3),i=a=>{if(n)return;let o=a.detail||{};o.disconnected||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),o.success&&M({name:o.name||`Printer (${e})`,address:o.address||e,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}),t({success:!!o.success,name:o.name,address:o.address||e,message:o.message||(o.success?`Terhubung ke printer!`:`Gagal menghubungkan printer.`)}))};window.addEventListener(`sanubari-bt-connect-result`,i);try{window.SanubariAndroidBluetooth.connectDevice(e)}catch(a){n||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:a?.message||`Gagal memanggil koneksi Bluetooth Android.`}))}})}function R(){if(M(null),k())try{window.SanubariAndroidBluetooth.disconnectDevice()}catch{}if(E){try{E.gatt?.connected&&E.gatt.disconnect()}catch{}E=null,D=null}}async function z(){let e=navigator;if(!e.bluetooth)throw Error(`Web Bluetooth tidak tersedia di browser ini.`);try{let t=await e.bluetooth.requestDevice({acceptAllDevices:!0,optionalServices:[`000018f0-0000-1000-8000-00805f9b34fb`,`49535343-fe7d-4ae5-8fa9-9fafd205e455`,`0000e0ff-0000-1000-8000-00805f9b34fb`,`0000ff00-0000-1000-8000-00805f9b34fb`,`e7810a71-73ae-499d-8c15-faa9aef0c3f1`]});if(!t.gatt)throw Error(`Perangkat printer tidak mendukung koneksi GATT.`);let n=await(await t.gatt.connect()).getPrimaryServices(),r=null;for(let e of n){let t=await e.getCharacteristics();for(let e of t)if(e.properties.write||e.properties.writeWithoutResponse){r=e;break}if(r)break}if(!r)throw Error(`Tidak ditemukan karakteristik cetak pada perangkat Bluetooth ini.`);E=t,D=r;let i={name:t.name||`Printer Bluetooth`,address:t.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!0,source:`web-bluetooth`};return M(i),i}catch(e){if(e?.name===`NotFoundError`)return null;throw e}}function B(e,t=`58mm`){return`rawbt:base64,${O(p(e,typeof t==`string`?{paper_width:t}:t||{}))}`}function V(e,t=`58mm`,n){return new Promise(r=>{if(!k()){r({success:!1,message:`Fitur Bluetooth Native Android belum aktif.`});return}let i=typeof t==`string`?{paper_width:t}:t||{},a=Math.max(1,Number(i.copies)||1),o=O(p(e,i)),s=j(),c=n||s?.address||``,l=!1,u=window.setTimeout(()=>{l||(l=!0,window.removeEventListener(`sanubari-bt-print-result`,d),r({success:!1,message:`Waktu cetak habis (timeout). Pastikan printer Bluetooth menyala dan kertas tersedia.`}))},2e4),d=e=>{if(l)return;l=!0,window.clearTimeout(u),window.removeEventListener(`sanubari-bt-print-result`,d);let t=e.detail||{};r({success:!!t.success,needSelectPrinter:!!t.needSelectPrinter,name:t.name,address:t.address,message:t.message||(t.success?`Struk berhasil dicetak!`:`Gagal mencetak struk.`)})};window.addEventListener(`sanubari-bt-print-result`,d);try{window.SanubariAndroidBluetooth.printEscPosBase64(o,c,a)}catch(e){l||(l=!0,window.clearTimeout(u),window.removeEventListener(`sanubari-bt-print-result`,d),r({success:!1,message:e?.message||`Gagal mengirim data cetak ke printer Bluetooth.`}))}})}async function H(e,t=`58mm`,n){if(k()){let r=await V(e,t,n);if(!r.success){let e=Error(r.message);throw e.needSelectPrinter=r.needSelectPrinter,e}return!0}if(!navigator.bluetooth){let e=Error(`Web Bluetooth tidak didukung di WebView ini. Gunakan fitur Pencarian Printer Bluetooth di aplikasi.`);throw e.code=`BT_UNSUPPORTED_WEBVIEW`,e}let r=typeof t==`string`?{paper_width:t}:t||{},i=Math.max(1,Number(r.copies)||1);try{let t=D;if(!t||!E?.gatt?.connected){if(!await z())return!1;t=D}if(!t)throw Error(`Tidak ditemukan karakteristik cetak pada printer Bluetooth ini.`);let n=p(e,r);for(let e=0;e<i;e++){for(let e=0;e<n.length;e+=100){let r=n.slice(e,e+100);t.properties.write?await t.writeValueWithResponse(r):await t.writeValueWithoutResponse(r),await new Promise(e=>setTimeout(e,20))}e<i-1&&await new Promise(e=>setTimeout(e,600))}return!0}catch(e){if(D=null,e.name===`NotFoundError`)return!1;throw e}}function U(e,t){let n=(t||e.customer_phone||``).replace(/[^0-9]/g,``);n.startsWith(`0`)&&(n=`62`+n.substring(1));let r=e.items.map((e,t)=>{let n=e.variant_label&&e.variant_label!==`Default`&&e.variant_label!==`Standar`?` (${e.variant_label})`:``;return`${t+1}. *${e.product_name}*${n}\n   ${e.quantity}x @ Rp ${o(e.price)} = Rp ${o(e.subtotal)}`}).join(`

`),i=`*${e.store_name.toUpperCase()}*\n`;i+=`_${e.tagline||`Specialty Coffee Roastery`}_\n`,i+=`========================================
`,i+=`*STRUK PEMBELIAN*
`,i+=`========================================
`,i+=`No. Struk : #${e.order_number}\n`,i+=`Tanggal   : ${e.date}\n`,i+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&(i+=`Pelanggan : ${e.customer_name}\n`),e.customer_phone&&e.customer_phone!==`-`&&(i+=`Telepon   : ${e.customer_phone}\n`),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&(i+=`Alamat    : ${e.customer_address}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(i+=`Ekspedisi : ${e.shipping_courier}\n`),i+=`----------------------------------------
`,i+=`*RINCIAN PESANAN:*

`,i+=`${r}\n`,i+=`----------------------------------------
`,i+=`Subtotal  : Rp ${o(e.subtotal)}\n`,e.discount_amount>0&&(i+=`Diskon    : -Rp ${o(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(i+=`Ongkir    : Rp ${o(e.shipping_cost)}\n`),i+=`*TOTAL    : Rp ${o(e.total_amount)}*\n`,i+=`Metode    : ${e.payment_method_label}\n`,e.cash_tendered&&e.cash_tendered>0&&(i+=`Tunai     : Rp ${o(e.cash_tendered)}\n`,i+=`Kembalian : Rp ${o(e.cash_change||0)}\n`),i+=`----------------------------------------
`,i+=`${e.footer_note||`Terima kasih telah berbelanja di Sanubari Roastery!`}\n`,e.instagram&&(i+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`);let a=encodeURIComponent(i);return n?`https://wa.me/${n}?text=${a}`:`https://wa.me/?text=${a}`}function W(e,t=`58mm`){let n=t===`80mm`?42:32,r=`-`.repeat(n),i=`=`.repeat(n),a=[];a.push(s(e.store_name.toUpperCase(),n)),a.push(s(`RINGKASAN PENJUALAN POS`,n)),a.push(i),a.push(c(`Periode:`,e.period_title,n)),a.push(c(`Dicetak:`,e.printed_at,n)),a.push(c(`Kasir:`,e.cashier_name,n)),a.push(r),a.push(c(`Total Transaksi`,`${e.total_transactions} Trx`,n)),a.push(c(`Total Omset`,`Rp ${o(e.total_revenue)}`,n)),a.push(c(`Rata-rata/Trx`,`Rp ${o(e.average_order_value)}`,n)),a.push(r),a.push(s(`METODE PEMBAYARAN`,n));for(let t of e.payment_breakdown)a.push(c(`${t.label} (${t.count})`,`Rp ${o(t.total)}`,n));if(a.push(r),e.cash_drawer&&(a.push(s(`ARUS KAS TUNAI LACI`,n)),a.push(c(`Penjualan Tunai`,`+Rp ${o(e.cash_drawer.cash_sales)}`,n)),a.push(c(`Kas Masuk Lain`,`+Rp ${o(e.cash_drawer.cash_in)}`,n)),a.push(c(`Kas Keluar Toko`,`-Rp ${o(e.cash_drawer.cash_out)}`,n)),a.push(c(`TOTAL KAS DI LACI`,`Rp ${o(e.cash_drawer.net_cash)}`,n)),a.push(r)),e.top_products&&e.top_products.length>0){a.push(s(`PRODUK TERLARIS`,n));for(let t of e.top_products.slice(0,5))a.push(t.name.length>n?t.name.substring(0,n):t.name),a.push(c(`  ${t.quantity}x (${t.variant})`,`Rp ${o(t.total)}`,n));a.push(r)}return a.push(i),a.push(s(`LAPORAN RESMI POS SANUBARI`,n)),a.join(`
`)}function G(e,t=`58mm`){let n=W(e,t),r=t===`80mm`?`76mm`:`48mm`,i=t===`80mm`?`80mm auto`:`58mm auto`;d(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Penjualan - ${e.period_title}</title>
    <style>
        @page {
            size: ${i};
            margin: 0;
        }
        body {
            margin: 0;
            padding: 2mm;
            width: ${r};
            font-family: 'Courier New', Courier, monospace, -apple-system;
            font-size: ${t===`80mm`?`12px`:`10.5px`};
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: inherit;
        }
        @media print {
            body {
                width: 100%;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <pre>${n.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>
</body>
</html>
    `,n,1,!1,t)}function K(e,t=`58mm`,n){let r=n?.receipt_columns||(t===`80mm`?42:32),i=`-`.repeat(r),a=`=`.repeat(r),l=[];if(l.push(s(e.store_name.toUpperCase(),r)),l.push(s(`LAPORAN LABA RUGI (P&L)`,r)),l.push(a),l.push(c(`Periode:`,e.period_title,r)),l.push(c(`Dicetak:`,e.printed_at,r)),l.push(c(`Kasir:`,e.cashier_name,r)),l.push(i),l.push(s(`1. PENDAPATAN PENJUALAN`,r)),l.push(c(`Total Transaksi`,`${e.total_transactions} Trx`,r)),l.push(c(`Barang Terjual`,`${e.items_sold} Item`,r)),l.push(c(`Penjualan Kotor`,`Rp ${o(e.gross_sales)}`,r)),e.total_discounts>0&&l.push(c(`Diskon Penjualan`,`-Rp ${o(e.total_discounts)}`,r)),l.push(c(`PENJUALAN BERSIH`,`Rp ${o(e.net_sales)}`,r)),l.push(i),l.push(s(`2. HARGA POKOK PENJUALAN`,r)),l.push(c(`Total HPP (COGS)`,`-Rp ${o(e.total_cogs)}`,r)),l.push(i),l.push(s(`3. LABA KOTOR (GROSS)`,r)),l.push(c(`Laba Kotor`,`Rp ${o(e.gross_profit)}`,r)),l.push(c(`Gross Margin`,`${e.gross_margin_pct}%`,r)),l.push(i),e.total_expenses>0||e.expense_breakdown&&e.expense_breakdown.length>0){if(l.push(s(`4. BEBAN KAS OPERASIONAL`,r)),e.expense_breakdown)for(let t of e.expense_breakdown)l.push(c(`- ${t.label}`,`-Rp ${o(t.total)}`,r));l.push(c(`TOTAL BEBAN KAS`,`-Rp ${o(e.total_expenses)}`,r)),l.push(i)}e.other_income>0&&(l.push(c(`Pendapatan Lain`,`+Rp ${o(e.other_income)}`,r)),l.push(i)),l.push(a),l.push(c(`LABA BERSIH (NET)`,`Rp ${o(e.net_profit)}`,r)),l.push(c(`Net Profit Margin`,`${e.net_margin_pct}%`,r)),l.push(a),l.push(s(`SANUBARI ROASTERY POS`,r));let u=n?.margin_feed_lines||2;for(let e=0;e<u;e++)l.push(``);return l.join(`
`)}function q(e,t=`58mm`,n){let r=K(e,t,n),i=t===`80mm`?`76mm`:`48mm`,a=t===`80mm`?`80mm auto`:`58mm auto`,o=n?.margin_horizontal||`1mm`;d(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Laporan Laba Rugi - ${e.period_title}</title>
    <style>
        @page {
            size: ${a};
            margin-left: ${o};
            margin-right: ${o};
            margin-top: 0;
            margin-bottom: 0;
        }
        body {
            margin: 0;
            padding: 2mm ${o};
            width: ${i};
            font-family: 'Courier New', Courier, monospace, -apple-system;
            font-size: ${t===`80mm`?`12px`:`10.5px`};
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: inherit;
        }
        @media print {
            body {
                width: 100%;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <pre>${r.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>
</body>
</html>
    `,r,1,!1,t)}function J(e){let t=e.items.map((e,t)=>{let n=e.variant_label&&e.variant_label!==`Default`&&e.variant_label!==`Standar`?` (${e.variant_label})`:``;return`${t+1}. *${e.product_name}*${n}\n   ${e.quantity}x @ Rp ${o(e.price)} = Rp ${o(e.subtotal)}`}).join(`

`),n=`*${e.store_name.toUpperCase()}*\n`;return e.tagline&&(n+=`_${e.tagline}_\n`),n+=`========================================
`,n+=`*ESTIMASI PESANAN (PRE-BILL)*
`,n+=`========================================
`,n+=`Status    : Menunggu Pembayaran
`,n+=`Waktu     : ${e.date}\n`,n+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name.trim()&&(n+=`Pelanggan : ${e.customer_name.trim()}\n`),e.customer_phone&&e.customer_phone.trim()&&(n+=`Telepon   : ${e.customer_phone.trim()}\n`),e.customer_address&&e.customer_address.trim()&&(n+=`Alamat    : ${e.customer_address.trim()}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(n+=`Ekspedisi : ${e.shipping_courier.trim()}\n`),e.notes&&e.notes.trim()&&(n+=`Catatan   : ${e.notes.trim()}\n`),n+=`----------------------------------------
`,n+=`*RINCIAN PESANAN:*

`,n+=`${t}\n`,n+=`----------------------------------------
`,n+=`Subtotal  : Rp ${o(e.subtotal)}\n`,e.discount_amount>0&&(n+=`Diskon    : -Rp ${o(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(n+=`Ongkir    : Rp ${o(e.shipping_cost)}\n`),n+=`*TOTAL TAGIHAN : Rp ${o(e.total_amount)}*\n`,n+=`----------------------------------------
`,(e.bank_info||e.qris_instructions)&&(n+=`*Informasi Pembayaran:*
`,e.bank_info&&(n+=`- Rekening: ${e.bank_info}\n`),e.qris_instructions&&(n+=`- QRIS: ${e.qris_instructions}\n`),n+=`----------------------------------------
`),n+=`Silakan konfirmasi pesanan ini atau lakukan pembayaran di kasir / transfer bank.
Terima kasih!
`,e.instagram&&(n+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`),n}function Y(e,t){let n=(t||e.customer_phone||``).replace(/[^0-9]/g,``);n.startsWith(`0`)&&(n=`62`+n.substring(1));let r=J(e),i=encodeURIComponent(r);return n?`https://wa.me/${n}?text=${i}`:`https://wa.me/?text=${i}`}function X(e,t=`58mm`){let n=t===`80mm`?42:32,r=`-`.repeat(n),i=`=`.repeat(n),a=[];a.push(s(e.store_name.toUpperCase(),n)),e.tagline&&a.push(s(e.tagline,n)),e.address&&a.push(s(e.address,n)),e.phone&&a.push(s(`Telp/WA: ${e.phone}`,n)),a.push(i),a.push(s(`ESTIMASI PESANAN (PRE-BILL)`,n)),a.push(s(`** BELUM DIBAYAR **`,n)),a.push(r),a.push(c(`Waktu:`,e.date,n)),a.push(c(`Kasir:`,e.cashier_name,n)),e.customer_name&&a.push(c(`Pelanggan:`,e.customer_name,n)),e.customer_phone&&a.push(c(`Telp/WA:`,e.customer_phone,n)),e.customer_address&&a.push(`Alamat: ${e.customer_address}`),a.push(r);for(let t of e.items){let e=t.product_name.length>n?t.product_name.substring(0,n):t.product_name;a.push(e);let r=`  ${t.quantity}x @${o(t.price)} (${t.variant_label})`,i=`Rp ${o(t.subtotal)}`;a.push(c(r,i,n))}if(a.push(r),a.push(c(`Subtotal`,`Rp ${o(e.subtotal)}`,n)),e.discount_amount>0&&a.push(c(`Diskon`,`-Rp ${o(e.discount_amount)}`,n)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;a.push(c(`Ongkir${t}`,`Rp ${o(e.shipping_cost)}`,n))}return a.push(i),a.push(c(`TOTAL TAGIHAN`,`Rp ${o(e.total_amount)}`,n)),a.push(r),e.bank_info&&(a.push(s(`PEMBAYARAN TRANSFER:`,n)),a.push(s(e.bank_info,n)),a.push(r)),a.push(s(`Silakan lakukan pembayaran di kasir`,n)),a.push(s(`Terima kasih!`,n)),a.join(`
`)}function Z(e,t=`58mm`){let n=X(e,t);d(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Pre-Bill / Estimasi Pesanan</title>
    <style>
        @page {
            size: ${t===`80mm`?`80mm auto`:`58mm auto`};
            margin: 0;
        }
        body {
            margin: 0;
            padding: 2mm;
            width: ${t===`80mm`?`76mm`:`48mm`};
            font-family: 'Courier New', Courier, monospace, -apple-system;
            font-size: ${t===`80mm`?`12px`:`10.5px`};
            line-height: 1.25;
            color: #000;
            background: #fff;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
            word-break: break-word;
            font-family: inherit;
            font-size: inherit;
        }
        @media print {
            body {
                width: 100%;
                padding: 0;
            }
        }
    </style>
</head>
<body>
    <pre>${n.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>
</body>
</html>
    `,n,1,!1,t)}export{n as A,S as C,a as D,F as E,i as O,f as S,P as T,Z as _,J as a,H as b,U as c,j as d,b as f,I as g,A as h,l as i,t as j,r as k,N as l,_ as m,R as n,Y as o,k as p,o as r,B as s,L as t,v as u,q as v,z as w,w as x,G as y};