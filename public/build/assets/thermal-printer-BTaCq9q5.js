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
            `,document.head.appendChild(h);let g=e.match(/<body[^>]*>([\s\S]*?)<\/body>/i),_=g?g[1]:`<pre>${(t||``).replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre>`,v=document.createElement(`div`);v.id=n,v.innerHTML=_,document.body.appendChild(v);try{let e=a?.printer_name||a?.usb_printer_name||``;if(typeof o.getPrinters==`function`)try{let t=await o.getPrinters();if(Array.isArray(t)&&t.length>0){if(e){let n=t.find(t=>t.name&&t.name.toLowerCase()===e.toLowerCase()||t.displayName&&t.displayName.toLowerCase()===e.toLowerCase());n&&(e=n.name)}if(!e){let n=t.find(e=>e.isDefault),r=t.find(e=>/pos80|pos58|pos-|thermal|receipt|tm-t|tm-u|xprinter|eppos|vsc|blueprint|panda|iware|codesoft|rpp|mtp/i.test(`${e.name||``} ${e.displayName||``}`)),i=e=>/microsoft print to pdf|xps document writer|onenote|fax/i.test(e||``),a=t.find(e=>!i(e.name));n&&!i(n.name)?e=n.name:r?e=r.name:a?e=a.name:n&&(e=n.name)}}}catch{}await new Promise(e=>requestAnimationFrame(()=>setTimeout(e,30)));let t=l?u*1e3:i===`80mm`?8e4:58e3,n=await o.printReceipt({silent:!0,printerName:e,pageSize:{width:t,height:2e5}});(!n||!n.success)&&(n=await o.printReceipt({silent:!0,printerName:e,pageSize:`A4`})),(!n||!n.success)&&e!==``&&await o.printReceipt({silent:!0,printerName:``,pageSize:`A4`})}finally{v.parentNode&&v.parentNode.removeChild(v),h.parentNode&&h.parentNode.removeChild(h)}})();return}if(j()&&t){let e=N();if(e&&e.address)try{let a=A(u(t,r,i));window.SanubariAndroidBluetooth.printEscPosBase64(a,e.address,Math.max(1,n));return}catch{}}let s=`sanubari-pos-silent-print-frame`,c=document.getElementById(s);c&&c.parentNode&&c.parentNode.removeChild(c);let l=document.createElement(`iframe`);l.id=s,l.setAttribute(`aria-hidden`,`true`),l.style.position=`fixed`,l.style.right=`0`,l.style.bottom=`0`,l.style.width=`0`,l.style.height=`0`,l.style.border=`0`,l.style.opacity=`0`,l.style.pointerEvents=`none`,l.style.zIndex=`-1`,document.body.appendChild(l);let d=l.contentWindow,f=l.contentDocument||d?.document;if(!f||!d)return;let p=!1,m=()=>{if(!p){p=!0;try{d.focus(),d.print()}catch{}window.setTimeout(()=>{l.parentNode&&l.parentNode.removeChild(l)},3e4)}};l.onload=m,f.open(),f.write(e),f.close(),window.setTimeout(m,80)}function f(e,t=`58mm`){let n=typeof t==`string`?{paper_width:t}:t||{},r=n.paper_width||`58mm`,i=r===`custom`,a=Math.max(30,Math.min(120,Number(n.custom_paper_width_mm)||58)),o=Math.max(20,Math.min(a,Number(n.custom_printable_width_mm)||a-4)),s=n.margin_horizontal||`2mm`,c=Math.max(1,Number(n.copies)||1),u=l(e,n),f=i?`${o}mm`:r===`80mm`?n.custom_printable_width_mm?`${n.custom_printable_width_mm}mm`:`72mm`:`48mm`,p=i?`${a}mm auto`:r===`80mm`?`80mm auto`:`58mm auto`,m=n.font_family||`monospace`,h=`'Courier New', Courier, monospace, -apple-system`;m===`courier`?h=`'Courier New', Courier, monospace`:m===`sans-serif`?h=`system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`:m===`consolas`?h=`'Consolas', 'Lucida Console', 'Courier New', monospace`:m===`roboto-mono`&&(h=`'Roboto Mono', monospace, 'Courier New'`);let g=n.font_size||`normal`,_=r===`80mm`||i&&a>=75?`12px`:`10.5px`;g===`compact`?_=r===`80mm`||i&&a>=75?`10.5px`:`9.5px`:g===`large`&&(_=r===`80mm`||i&&a>=75?`14px`:`12px`);let v=(n.font_weight||`normal`)===`bold`?`bold`:`normal`,y=[`SALINAN PELANGGAN`,`SALINAN KASIR / TOKO`,`SALINAN BAR / DAPUR`],b=``;for(let e=0;e<c;e++){let t=c>1?`<div style="text-align:center;font-weight:bold;font-size:10px;padding:3px 0;margin-bottom:4px;border-bottom:1px dashed #666;">[ ${y[e]||`SALINAN #${e+1}`} ]</div>`:``,n=e<c-1?`<div style="text-align:center;font-size:10px;margin:12px 0;border-top:1px dashed #999;padding-top:4px;color:#666;">- - - - - POTONG DI SINI - - - - -</div>`:``;b+=`<div class="receipt-copy">${t}<pre>${u.replace(/</g,`&lt;`).replace(/>/g,`&gt;`)}</pre></div>${n}`}d(`
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


`),a=new Uint8Array([27,64]),o=n.font_size===`compact`?new Uint8Array([27,77,1]):new Uint8Array([27,77,0]),s=n.font_weight===`bold`?new Uint8Array([27,69,1]):new Uint8Array([27,69,0]),c=n.open_cash_drawer?new Uint8Array([27,112,0,25,250]):new Uint8Array([]),u=(n.paper_width||`58mm`)===`80mm`,d=n.paper_width===`custom`,f=Number(n.custom_paper_width_mm)||58,p=u||d&&f>=75?new Uint8Array([29,86,0]):new Uint8Array([]),m=a.length+o.length+s.length+c.length+i.length+p.length,h=new Uint8Array(m),g=0;return h.set(a,g),g+=a.length,h.set(o,g),g+=o.length,h.set(s,g),g+=s.length,c.length>0&&(h.set(c,g),g+=c.length),h.set(i,g),g+=i.length,p.length>0&&(h.set(p,g),g+=p.length),h}var m=`sanubari_pos_usb_printer_v1`,h=null,g=null,_=null;function v(){return typeof window<`u`&&!!window.electronAPI?.isDesktop}async function y(){if(typeof window>`u`)return[];let e=window.electronAPI;if(e&&typeof e.getPrinters==`function`)try{let t=await e.getPrinters();if(Array.isArray(t))return t.map(e=>({name:e.name||``,displayName:e.displayName||e.name||``,isDefault:!!e.isDefault,description:e.description||``,status:e.status}))}catch(e){console.warn(`Failed to get printers from electronAPI:`,e)}return[]}function b(){return typeof navigator<`u`&&`usb`in navigator&&typeof navigator.usb?.requestDevice==`function`}function x(){if(typeof window>`u`)return null;try{let e=localStorage.getItem(m);return e?JSON.parse(e):null}catch{return null}}function S(e){if(!(typeof window>`u`))try{e?localStorage.setItem(m,JSON.stringify(e)):localStorage.removeItem(m)}catch{}}function C(){if(h)try{_!==null&&h.releaseInterface(_),h.close()}catch{}h=null,_=null,g=null,S(null)}async function w(){if(!b())return!1;try{let e=x();if(!e)return!1;let t=(await navigator.usb.getDevices()).find(t=>t.vendorId===e.vendorId&&t.productId===e.productId);if(!t)return!1;await t.open(),t.configuration===null&&await t.selectConfiguration(1);let n=null,r=null;if(t.configuration&&Array.isArray(t.configuration.interfaces))for(let e of t.configuration.interfaces){for(let t of e.alternates||[]){for(let i of t.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){n=e.interfaceNumber,r=i.endpointNumber;break}if(r!==null)break}if(r!==null)break}if(n!==null)try{await t.claimInterface(n)}catch{}return h=t,_=n,g=r,!0}catch{return!1}}async function T(){if(!b())throw Error(`Browser ini tidak mendukung WebUSB. Silakan gunakan Google Chrome atau Microsoft Edge di Windows.`);let e=await navigator.usb.requestDevice({filters:[]});if(!e)return null;await e.open(),e.configuration===null&&await e.selectConfiguration(1);let t=null,n=null;if(e.configuration&&Array.isArray(e.configuration.interfaces))for(let r of e.configuration.interfaces){for(let e of r.alternates||[]){for(let i of e.endpoints||[])if(i.direction===`out`&&(i.type===`bulk`||i.type===`interrupt`)){t=r.interfaceNumber,n=i.endpointNumber;break}if(n!==null)break}if(n!==null)break}if(t!==null)try{await e.claimInterface(t)}catch{}h=e,_=t,g=n;let r=`0x`+e.vendorId.toString(16).padStart(4,`0`).toUpperCase(),i=`0x`+e.productId.toString(16).padStart(4,`0`).toUpperCase(),a={name:e.productName||`Thermal USB Printer (${r}:${i})`,vendorId:e.vendorId,productId:e.productId,productName:e.productName||`Thermal POS Printer`,manufacturerName:e.manufacturerName,serialNumber:e.serialNumber,connected:!0};return S(a),a}async function E(e,t=`58mm`){let n=p(e,typeof t==`string`?{paper_width:t}:t||{});if((!h||!h.opened)&&!await w()&&!await T())return!1;if(!h)throw Error(`Printer USB tidak terhubung.`);let r=g??1;return await h.transferOut(r,n),!0}var D=`sanubari_pos_bt_printer_v1`,O=null,k=null;function A(e){let t=``,n=e.byteLength;for(let r=0;r<n;r++)t+=String.fromCharCode(e[r]);return typeof window<`u`?window.btoa(t):``}function j(){if(typeof window>`u`)return!1;let e=window.SanubariAndroidBluetooth;try{return!!(e&&typeof e.isNativeAvailable==`function`&&e.isNativeAvailable())}catch{return!!e}}function M(){return typeof navigator>`u`?!1:!!navigator.bluetooth}function N(){if(typeof window>`u`)return null;if(j())try{let e=window.SanubariAndroidBluetooth.getStatus(),t=JSON.parse(e);if(t&&t.savedAddress)return{name:t.savedName||`Printer (${t.savedAddress})`,address:t.savedAddress,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}}catch{}if(O&&k)return{name:O.name||`Printer Bluetooth (Web)`,address:O.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!!O.gatt?.connected,source:`web-bluetooth`};try{let e=window.localStorage.getItem(D);if(e)return JSON.parse(e)}catch{}return null}function P(e){if(!(typeof window>`u`))try{e?window.localStorage.setItem(D,JSON.stringify(e)):window.localStorage.removeItem(D)}catch{}}function F(){if(!j())return[];try{let e=window.SanubariAndroidBluetooth.getDevices(),t=JSON.parse(e);return Array.isArray(t)?t.sort((e,t)=>e.connected&&!t.connected?-1:!e.connected&&t.connected?1:e.isPrinter&&!t.isPrinter?-1:!e.isPrinter&&t.isPrinter?1:e.bonded&&!t.bonded?-1:!e.bonded&&t.bonded?1:(e.name||``).localeCompare(t.name||``)):[]}catch{return[]}}function I(){if(!j())return!1;try{return window.SanubariAndroidBluetooth.startScan(),!0}catch{return!1}}function L(){if(j())try{window.SanubariAndroidBluetooth.stopScan()}catch{}}function R(){if(j())try{window.SanubariAndroidBluetooth.openBluetoothSettings();return}catch{}if(typeof window<`u`)try{window.location.href=`intent:#Intent;action=android.settings.BLUETOOTH_SETTINGS;end`}catch{}}function z(e){return new Promise(t=>{if(!j()){t({success:!1,message:`Jembatan Bluetooth Native Android tidak tersedia.`});return}let n=!1,r=window.setTimeout(()=>{n||(n=!0,window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:`Waktu koneksi habis (timeout). Pastikan printer Bluetooth menyala dan berada di dekat perangkat.`}))},16e3),i=a=>{if(n)return;let o=a.detail||{};o.disconnected||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),o.success&&P({name:o.name||`Printer (${e})`,address:o.address||e,bonded:!0,isPrinter:!0,connected:!0,source:`android-native`}),t({success:!!o.success,name:o.name,address:o.address||e,message:o.message||(o.success?`Terhubung ke printer!`:`Gagal menghubungkan printer.`)}))};window.addEventListener(`sanubari-bt-connect-result`,i);try{window.SanubariAndroidBluetooth.connectDevice(e)}catch(a){n||(n=!0,window.clearTimeout(r),window.removeEventListener(`sanubari-bt-connect-result`,i),t({success:!1,address:e,message:a?.message||`Gagal memanggil koneksi Bluetooth Android.`}))}})}function B(){if(P(null),j())try{window.SanubariAndroidBluetooth.disconnectDevice()}catch{}if(O){try{O.gatt?.connected&&O.gatt.disconnect()}catch{}O=null,k=null}}async function V(){let e=navigator;if(!e.bluetooth)throw Error(`Web Bluetooth tidak tersedia di browser ini.`);try{let t=await e.bluetooth.requestDevice({acceptAllDevices:!0,optionalServices:[`000018f0-0000-1000-8000-00805f9b34fb`,`49535343-fe7d-4ae5-8fa9-9fafd205e455`,`0000e0ff-0000-1000-8000-00805f9b34fb`,`0000ff00-0000-1000-8000-00805f9b34fb`,`e7810a71-73ae-499d-8c15-faa9aef0c3f1`]});if(!t.gatt)throw Error(`Perangkat printer tidak mendukung koneksi GATT.`);let n=await(await t.gatt.connect()).getPrimaryServices(),r=null;for(let e of n){let t=await e.getCharacteristics();for(let e of t)if(e.properties.write||e.properties.writeWithoutResponse){r=e;break}if(r)break}if(!r)throw Error(`Tidak ditemukan karakteristik cetak pada perangkat Bluetooth ini.`);O=t,k=r;let i={name:t.name||`Printer Bluetooth`,address:t.id||`WEB-BT`,bonded:!0,isPrinter:!0,connected:!0,source:`web-bluetooth`};return P(i),i}catch(e){if(e?.name===`NotFoundError`)return null;throw e}}function H(e,t=`58mm`){return`rawbt:base64,${A(p(e,typeof t==`string`?{paper_width:t}:t||{}))}`}function U(e,t=`58mm`,n){return new Promise(r=>{if(!j()){r({success:!1,message:`Fitur Bluetooth Native Android belum aktif.`});return}let i=typeof t==`string`?{paper_width:t}:t||{},a=Math.max(1,Number(i.copies)||1),o=A(p(e,i)),s=N(),c=n||s?.address||``,l=!1,u=window.setTimeout(()=>{l||(l=!0,window.removeEventListener(`sanubari-bt-print-result`,d),r({success:!1,message:`Waktu cetak habis (timeout). Pastikan printer Bluetooth menyala dan kertas tersedia.`}))},2e4),d=e=>{if(l)return;l=!0,window.clearTimeout(u),window.removeEventListener(`sanubari-bt-print-result`,d);let t=e.detail||{};r({success:!!t.success,needSelectPrinter:!!t.needSelectPrinter,name:t.name,address:t.address,message:t.message||(t.success?`Struk berhasil dicetak!`:`Gagal mencetak struk.`)})};window.addEventListener(`sanubari-bt-print-result`,d);try{window.SanubariAndroidBluetooth.printEscPosBase64(o,c,a)}catch(e){l||(l=!0,window.clearTimeout(u),window.removeEventListener(`sanubari-bt-print-result`,d),r({success:!1,message:e?.message||`Gagal mengirim data cetak ke printer Bluetooth.`}))}})}async function W(e,t=`58mm`,n){if(j()){let r=await U(e,t,n);if(!r.success){let e=Error(r.message);throw e.needSelectPrinter=r.needSelectPrinter,e}return!0}if(!navigator.bluetooth){let e=Error(`Web Bluetooth tidak didukung di WebView ini. Gunakan fitur Pencarian Printer Bluetooth di aplikasi.`);throw e.code=`BT_UNSUPPORTED_WEBVIEW`,e}let r=typeof t==`string`?{paper_width:t}:t||{},i=Math.max(1,Number(r.copies)||1);try{let t=k;if(!t||!O?.gatt?.connected){if(!await V())return!1;t=k}if(!t)throw Error(`Tidak ditemukan karakteristik cetak pada printer Bluetooth ini.`);let n=p(e,r);for(let e=0;e<i;e++){for(let e=0;e<n.length;e+=100){let r=n.slice(e,e+100);t.properties.write?await t.writeValueWithResponse(r):await t.writeValueWithoutResponse(r),await new Promise(e=>setTimeout(e,20))}e<i-1&&await new Promise(e=>setTimeout(e,600))}return!0}catch(e){if(k=null,e.name===`NotFoundError`)return!1;throw e}}function G(e,t){let n=(t||e.customer_phone||``).replace(/[^0-9]/g,``);n.startsWith(`0`)&&(n=`62`+n.substring(1));let r=e.items.map((e,t)=>{let n=e.variant_label&&e.variant_label!==`Default`&&e.variant_label!==`Standar`?` (${e.variant_label})`:``;return`${t+1}. *${e.product_name}*${n}\n   ${e.quantity}x @ Rp ${o(e.price)} = Rp ${o(e.subtotal)}`}).join(`

`),i=`*${e.store_name.toUpperCase()}*\n`;i+=`_${e.tagline||`Specialty Coffee Roastery`}_\n`,i+=`========================================
`,i+=`*STRUK PEMBELIAN*
`,i+=`========================================
`,i+=`No. Struk : #${e.order_number}\n`,i+=`Tanggal   : ${e.date}\n`,i+=`Kasir     : ${e.cashier_name}\n`,e.customer_name&&e.customer_name!==`Pelanggan Kasir`&&(i+=`Pelanggan : ${e.customer_name}\n`),e.customer_phone&&e.customer_phone!==`-`&&(i+=`Telepon   : ${e.customer_phone}\n`),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`&&(i+=`Alamat    : ${e.customer_address}\n`),e.shipping_courier&&(e.shipping_cost||0)>0&&(i+=`Ekspedisi : ${e.shipping_courier}\n`),i+=`----------------------------------------
`,i+=`*RINCIAN PESANAN:*

`,i+=`${r}\n`,i+=`----------------------------------------
`,i+=`Subtotal  : Rp ${o(e.subtotal)}\n`,e.discount_amount>0&&(i+=`Diskon    : -Rp ${o(e.discount_amount)}\n`),e.shipping_cost&&e.shipping_cost>0&&(i+=`Ongkir    : Rp ${o(e.shipping_cost)}\n`),i+=`*TOTAL    : Rp ${o(e.total_amount)}*\n`,i+=`Metode    : ${e.payment_method_label}\n`,e.cash_tendered&&e.cash_tendered>0&&(i+=`Tunai     : Rp ${o(e.cash_tendered)}\n`,i+=`Kembalian : Rp ${o(e.cash_change||0)}\n`),i+=`----------------------------------------
`,i+=`${e.footer_note||`Terima kasih telah berbelanja di Sanubari Roastery!`}\n`,e.instagram&&(i+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`);let a=encodeURIComponent(i);return n?`https://wa.me/${n}?text=${a}`:`https://wa.me/?text=${a}`}function K(e,t=`58mm`){let n=t===`80mm`?42:32,r=`-`.repeat(n),i=`=`.repeat(n),a=[];a.push(s(e.store_name.toUpperCase(),n)),a.push(s(`RINGKASAN PENJUALAN POS`,n)),a.push(i),a.push(c(`Periode:`,e.period_title,n)),a.push(c(`Dicetak:`,e.printed_at,n)),a.push(c(`Kasir:`,e.cashier_name,n)),a.push(r),a.push(c(`Total Transaksi`,`${e.total_transactions} Trx`,n)),a.push(c(`Total Omset`,`Rp ${o(e.total_revenue)}`,n)),a.push(c(`Rata-rata/Trx`,`Rp ${o(e.average_order_value)}`,n)),a.push(r),a.push(s(`METODE PEMBAYARAN`,n));for(let t of e.payment_breakdown)a.push(c(`${t.label} (${t.count})`,`Rp ${o(t.total)}`,n));if(a.push(r),e.cash_drawer&&(a.push(s(`ARUS KAS TUNAI LACI`,n)),a.push(c(`Penjualan Tunai`,`+Rp ${o(e.cash_drawer.cash_sales)}`,n)),a.push(c(`Kas Masuk Lain`,`+Rp ${o(e.cash_drawer.cash_in)}`,n)),a.push(c(`Kas Keluar Toko`,`-Rp ${o(e.cash_drawer.cash_out)}`,n)),a.push(c(`TOTAL KAS DI LACI`,`Rp ${o(e.cash_drawer.net_cash)}`,n)),a.push(r)),e.top_products&&e.top_products.length>0){a.push(s(`PRODUK TERLARIS`,n));for(let t of e.top_products.slice(0,5))a.push(t.name.length>n?t.name.substring(0,n):t.name),a.push(c(`  ${t.quantity}x (${t.variant})`,`Rp ${o(t.total)}`,n));a.push(r)}return a.push(i),a.push(s(`LAPORAN RESMI POS SANUBARI`,n)),a.join(`
`)}function q(e,t=`58mm`){let n=K(e,t),r=t===`80mm`?`76mm`:`48mm`,i=t===`80mm`?`80mm auto`:`58mm auto`;d(`
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
    `,n,1,!1,t)}function J(e,t=`58mm`,n){let r=n?.receipt_columns||(t===`80mm`?42:32),i=`-`.repeat(r),a=`=`.repeat(r),l=[];if(l.push(s(e.store_name.toUpperCase(),r)),l.push(s(`LAPORAN LABA RUGI (P&L)`,r)),l.push(a),l.push(c(`Periode:`,e.period_title,r)),l.push(c(`Dicetak:`,e.printed_at,r)),l.push(c(`Kasir:`,e.cashier_name,r)),l.push(i),l.push(s(`1. PENDAPATAN PENJUALAN`,r)),l.push(c(`Total Transaksi`,`${e.total_transactions} Trx`,r)),l.push(c(`Barang Terjual`,`${e.items_sold} Item`,r)),l.push(c(`Penjualan Kotor`,`Rp ${o(e.gross_sales)}`,r)),e.total_discounts>0&&l.push(c(`Diskon Penjualan`,`-Rp ${o(e.total_discounts)}`,r)),l.push(c(`PENJUALAN BERSIH`,`Rp ${o(e.net_sales)}`,r)),l.push(i),l.push(s(`2. HARGA POKOK PENJUALAN`,r)),l.push(c(`Total HPP (COGS)`,`-Rp ${o(e.total_cogs)}`,r)),l.push(i),l.push(s(`3. LABA KOTOR (GROSS)`,r)),l.push(c(`Laba Kotor`,`Rp ${o(e.gross_profit)}`,r)),l.push(c(`Gross Margin`,`${e.gross_margin_pct}%`,r)),l.push(i),e.total_expenses>0||e.expense_breakdown&&e.expense_breakdown.length>0){if(l.push(s(`4. BEBAN KAS OPERASIONAL`,r)),e.expense_breakdown)for(let t of e.expense_breakdown)l.push(c(`- ${t.label}`,`-Rp ${o(t.total)}`,r));l.push(c(`TOTAL BEBAN KAS`,`-Rp ${o(e.total_expenses)}`,r)),l.push(i)}e.other_income>0&&(l.push(c(`Pendapatan Lain`,`+Rp ${o(e.other_income)}`,r)),l.push(i)),l.push(a),l.push(c(`LABA BERSIH (NET)`,`Rp ${o(e.net_profit)}`,r)),l.push(c(`Net Profit Margin`,`${e.net_margin_pct}%`,r)),l.push(a),l.push(s(`SANUBARI ROASTERY POS`,r));let u=n?.margin_feed_lines||2;for(let e=0;e<u;e++)l.push(``);return l.join(`
`)}function Y(e,t=`58mm`,n){let r=J(e,t,n),i=t===`80mm`?`76mm`:`48mm`,a=t===`80mm`?`80mm auto`:`58mm auto`,o=n?.margin_horizontal||`1mm`;d(`
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
    `,r,1,!1,t)}function X(e){let t=e.items.map((e,t)=>{let n=e.variant_label&&e.variant_label!==`Default`&&e.variant_label!==`Standar`?` (${e.variant_label})`:``;return`${t+1}. *${e.product_name}*${n}\n   ${e.quantity}x @ Rp ${o(e.price)} = Rp ${o(e.subtotal)}`}).join(`

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
`,e.instagram&&(n+=`\nInstagram: https://instagram.com/${e.instagram.replace(`@`,``)}\n`),n}function Z(e,t){let n=(t||e.customer_phone||``).replace(/[^0-9]/g,``);n.startsWith(`0`)&&(n=`62`+n.substring(1));let r=X(e),i=encodeURIComponent(r);return n?`https://wa.me/${n}?text=${i}`:`https://wa.me/?text=${i}`}function Q(e,t=`58mm`){let n=t===`80mm`?42:32,r=`-`.repeat(n),i=`=`.repeat(n),a=[];a.push(s(e.store_name.toUpperCase(),n)),e.tagline&&a.push(s(e.tagline,n)),e.address&&a.push(s(e.address,n)),e.phone&&a.push(s(`Telp/WA: ${e.phone}`,n)),a.push(i),a.push(s(`ESTIMASI PESANAN (PRE-BILL)`,n)),a.push(s(`** BELUM DIBAYAR **`,n)),a.push(r),a.push(c(`Waktu:`,e.date,n)),a.push(c(`Kasir:`,e.cashier_name,n)),e.customer_name&&a.push(c(`Pelanggan:`,e.customer_name,n)),e.customer_phone&&a.push(c(`Telp/WA:`,e.customer_phone,n)),e.customer_address&&a.push(`Alamat: ${e.customer_address}`),a.push(r);for(let t of e.items){let e=t.product_name.length>n?t.product_name.substring(0,n):t.product_name;a.push(e);let r=`  ${t.quantity}x @${o(t.price)} (${t.variant_label})`,i=`Rp ${o(t.subtotal)}`;a.push(c(r,i,n))}if(a.push(r),a.push(c(`Subtotal`,`Rp ${o(e.subtotal)}`,n)),e.discount_amount>0&&a.push(c(`Diskon`,`-Rp ${o(e.discount_amount)}`,n)),e.shipping_cost&&e.shipping_cost>0){let t=e.shipping_courier?` (${e.shipping_courier})`:``;a.push(c(`Ongkir${t}`,`Rp ${o(e.shipping_cost)}`,n))}return a.push(i),a.push(c(`TOTAL TAGIHAN`,`Rp ${o(e.total_amount)}`,n)),a.push(r),e.bank_info&&(a.push(s(`PEMBAYARAN TRANSFER:`,n)),a.push(s(e.bank_info,n)),a.push(r)),a.push(s(`Silakan lakukan pembayaran di kasir`,n)),a.push(s(`Terima kasih!`,n)),a.join(`
`)}function $(e,t=`58mm`){let n=Q(e,t);d(`
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
    `,n,1,!1,t)}function ee(e){let t=595.28,n=841.89,r=553.28,i=e=>(e||``).replace(/[•★]/g,`*`).replace(/[—–]/g,`-`).replace(/[“”]/g,`"`).replace(/[‘’]/g,`'`).replace(/[^\x20-\x7E]/g,``).replace(/\\/g,`\\\\`).replace(/\(/g,`\\(`).replace(/\)/g,`\\)`),a=(e,t)=>{let n=(e||``).trim();return n.length<=t?n:n.slice(0,t-3)+`...`},s=(e,t)=>{let n=(e||``).replace(/\s+/g,` `).trim();if(!n)return[];let r=n.split(` `),i=[],a=``;for(let e of r)a?(a+` `+e).length<=t?a+=` `+e:(i.push(a),a=e):a=e;return a&&i.push(a),i},c=(e,t,n)=>{let r=(e||``).replace(/[^\x20-\x7E]/g,``);if(t===`F4`)return r.length*n*.6;let i=t===`F2`?.55:.51,a=0;for(let e=0;e<r.length;e++){let t=r[e];`ilI1.,:;!| '()`.includes(t)?a+=n*.28:`MW@%mw`.includes(t)?a+=n*.78:a+=t>=`A`&&t<=`Z`?n*(i+.09):n*i}return a},l=(e,t,r,a,o,s)=>{let c=n-t;return`BT /${a} ${o.toFixed(2)} Tf ${s[0].toFixed(3)} ${s[1].toFixed(3)} ${s[2].toFixed(3)} rg ${e.toFixed(2)} ${c.toFixed(2)} Td (${i(r)}) Tj ET`},u=(e,t,n,r,i,a)=>{let o=c(n,r,i);return l(Math.max(12,e-o),t,n,r,i,a)},d=(e,t,n,r,i,a,o)=>{let s=c(r,i,a);return l(e+Math.max(0,(t-s)/2),n,r,i,a,o)},f=(e,t,r,i,a,o,s=1)=>{let c=n-(t+i),l=[`q`];a&&l.push(`${a[0].toFixed(3)} ${a[1].toFixed(3)} ${a[2].toFixed(3)} rg`),o&&l.push(`${o[0].toFixed(3)} ${o[1].toFixed(3)} ${o[2].toFixed(3)} RG ${s.toFixed(2)} w`);let u=a&&o?`B`:a?`f`:`S`;return l.push(`${e.toFixed(2)} ${c.toFixed(2)} ${r.toFixed(2)} ${i.toFixed(2)} re ${u} Q`),l.join(` `)},p=(e,t,r,i,a,o=1)=>{let s=n-t,c=n-i;return`q ${a[0].toFixed(3)} ${a[1].toFixed(3)} ${a[2].toFixed(3)} RG ${o.toFixed(2)} w ${e.toFixed(2)} ${s.toFixed(2)} m ${r.toFixed(2)} ${c.toFixed(2)} l S Q`},m=(e.store_name||`SANUBARI ROASTERY`).toUpperCase(),h=e.tagline||`Close to Your Every Brew`,g=e.address||`Ruko Tlogomas Square Kav. 34, Jl. Raya Tlogomas, Lowokwaru, Kota Malang`,_=e.phone||`+6285121930454`,v=e.date||``,y=e.cashier_name||`Kasir Sanubari`,b=(e.customer_name||``).trim()||`Pelanggan Sanubari`,x=!!(e.notes&&e.notes.toLowerCase().includes(`no. struk:`)),S=[];S.push(f(0,0,t,n,[1,1,1],null)),S.push(l(42,58,m,`F2`,17,[.067,.094,.153])),S.push(l(42,73,h,`F3`,9.5,[.294,.333,.388]));let C=88;for(let e of s(g,58))S.push(l(42,C,e,`F1`,8.5,[.42,.447,.502])),C+=12;S.push(l(42,C,`Telp/WA: ${_}`,`F1`,8.5,[.42,.447,.502]));let w=387.28;S.push(f(w,44,166,18,[.925,.992,.961],[.655,.953,.816],.8)),S.push(d(w,166,56,`FAKTUR PENJUALAN DIGITAL (A4)`,`F2`,8,[.024,.373,.275])),S.push(u(r,76,`Waktu: ${v} WIB`,`F2`,9.5,[.067,.094,.153])),S.push(u(r,90,`Kasir: ${y}`,`F1`,9,[.294,.333,.388]));let T=x?`LUNAS (PAID)`:`ESTIMASI (PRE-BILL)`,E=x?86:112,D=r-E;x?(S.push(f(D,97,E,16,[.82,.98,.898],[.431,.906,.718],.8)),S.push(d(D,E,108,T,`F2`,8,[.024,.373,.275]))):(S.push(f(D,97,E,16,[.996,.953,.78],[.992,.902,.541],.8)),S.push(d(D,E,108,T,`F2`,8,[.471,.208,.059])));let O=Math.max(C+14,124);S.push(p(42,O,r,O,[.067,.094,.153],1.8));let k=O+18;S.push(l(42,k,`DITUJUKAN KEPADA:`,`F2`,8,[.612,.639,.686])),S.push(l(42,k+15,b,`F2`,12.5,[.067,.094,.153]));let A=k+29;if(e.customer_phone&&e.customer_phone!==`-`&&(S.push(l(42,A,`No. WhatsApp: ${e.customer_phone}`,`F1`,9,[.294,.333,.388])),A+=13),e.customer_address&&e.customer_address!==`Toko Fisik / POS Kasir`)for(let t of s(`Alamat Kirim: ${e.customer_address}`,56))S.push(l(42,A,t,`F1`,8.5,[.216,.255,.318])),A+=12;if(e.shipping_courier&&(e.shipping_cost||0)>0&&(S.push(l(42,A,`Ekspedisi: ${e.shipping_courier}`,`F1`,8.5,[.294,.333,.388])),A+=12),e.notes)for(let t of s(`Catatan: ${e.notes}`,60))S.push(l(42,A,t,`F3`,8.5,[.42,.447,.502])),A+=12;S.push(u(r,k,`STATUS DOKUMEN:`,`F2`,8,[.612,.639,.686])),S.push(u(r,k+14,x?`PEMBAYARAN LUNAS`:`MENUNGGU PEMBAYARAN`,`F2`,9.5,x?[.024,.373,.275]:[.573,.251,.055])),S.push(u(r,k+27,`POS Cashier Digital Invoice`,`F1`,8.5,[.42,.447,.502]));let j=Math.max(A+12,k+46),M=398.28,N=549.28;S.push(d(42,28,j,`NO`,`F2`,8,[.294,.333,.388])),S.push(l(76,j,`DESKRIPSI PRODUK & VARIAN`,`F2`,8,[.294,.333,.388])),S.push(u(M,j,`HARGA`,`F2`,8,[.294,.333,.388])),S.push(d(423.28,40,j,`QTY`,`F2`,8,[.294,.333,.388])),S.push(u(N,j,`JUMLAH (IDR)`,`F2`,8,[.294,.333,.388]));let P=j+8;S.push(p(42,P,r,P,[.82,.835,.859],1.3));for(let t=0;t<e.items.length&&!(P>651.89);t++){let n=e.items[t];S.push(d(42,28,P+16,String(t+1),`F4`,9,[.42,.447,.502])),S.push(l(76,P+14,a(n.product_name,44),`F2`,10,[.067,.094,.153])),S.push(l(76,P+26,`Varian: ${a(n.variant_label||`Standar`,48)}`,`F1`,8.5,[.42,.447,.502])),S.push(u(M,P+19,`Rp ${o(n.price)}`,`F1`,9.5,[.216,.255,.318])),S.push(d(423.28,40,P+19,String(n.quantity),`F2`,9.5,[.067,.094,.153])),S.push(u(N,P+19,`Rp ${o(n.subtotal)}`,`F2`,9.5,[.067,.094,.153])),P+=34,S.push(p(42,P,r,P,[.898,.906,.922],.7))}let F=P+18,I=F;if(e.bank_info||e.qris_instructions){let t=[];e.bank_info&&t.push(...s(`Rekening Bank: ${e.bank_info}`,44)),e.qris_instructions&&t.push(...s(`QRIS: ${e.qris_instructions}`,44));let n=26+t.length*13;S.push(f(42,I,281.204,n,[.976,.98,.984],[.898,.906,.922],.8)),S.push(l(52,I+15,`PETUNJUK PEMBAYARAN TRANSFER / QRIS:`,`F2`,8.5,[.024,.373,.275]));let r=I+29;for(let e of t)S.push(l(52,r,e,`F1`,8.5,[.067,.094,.153])),r+=13;I+=n+14}S.push(f(42,I,148,44,[1,1,1],[.122,.161,.216],1.4)),S.push(d(42,148,I+12,`SANUBARI ROASTERY`,`F2`,7,[.42,.447,.502])),S.push(d(42,148,I+26,x?`* RESMI (LUNAS) *`:`* RESMI (PRE-BILL) *`,`F2`,9.5,[.024,.373,.275])),S.push(d(42,148,I+38,`MALANG - ${v}`,`F4`,6.8,[.612,.639,.686]));let L=1;e.discount_amount>0&&L++,(e.shipping_cost||0)>0&&L++;let R=46+L*16;S.push(f(348.768,F,204.512,R,[.976,.98,.984],[.898,.906,.922],.8));let z=F+18;if(S.push(l(360.768,z,`Subtotal:`,`F1`,9.5,[.294,.333,.388])),S.push(u(541.28,z,`Rp ${o(e.subtotal)}`,`F2`,9.5,[.067,.094,.153])),z+=16,e.discount_amount>0&&(S.push(l(360.768,z,`Potongan Diskon:`,`F1`,9.5,[.016,.471,.341])),S.push(u(541.28,z,`-Rp ${o(e.discount_amount)}`,`F2`,9.5,[.016,.471,.341])),z+=16),(e.shipping_cost||0)>0){let t=`Ongkos Kirim${e.shipping_courier?` (${e.shipping_courier})`:``}:`;S.push(l(360.768,z,a(t,24),`F1`,9.5,[.118,.251,.686])),S.push(u(541.28,z,`Rp ${o(e.shipping_cost||0)}`,`F2`,9.5,[.118,.251,.686])),z+=16}S.push(p(360.768,z-4,541.28,z-4,[.82,.835,.859],1.2)),S.push(l(360.768,z+14,`TOTAL:`,`F2`,10.5,[.067,.094,.153])),S.push(u(541.28,z+15,`Rp ${o(e.total_amount)}`,`F2`,14.5,[.067,.094,.153]));let B=Math.max(I+44+34,F+R+34);S.push(p(42,B,r,B,[.898,.906,.922],.8)),S.push(d(42,511.28,B+16,`Terima kasih telah memesan di Sanubari Roastery! Dokumen ini adalah faktur digital resmi format A4 yang diterbitkan oleh sistem POS Sanubari.`,`F1`,8,[.612,.639,.686]));let V=S.join(`
`),H=[`<< /Type /Catalog /Pages 2 0 R >>`,`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`,`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${t.toFixed(2)} ${n.toFixed(2)}] /Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R /F4 7 0 R >> >> /Contents 8 0 R >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`,`<< /Type /Font /Subtype /Type1 /BaseFont /Courier /Encoding /WinAnsiEncoding >>`,`<< /Length ${V.length} >>\nstream\n${V}\nendstream`],U=`%PDF-1.4
`,W=[];for(let e=0;e<H.length;e++)W.push(U.length),U+=`${e+1} 0 obj\n${H[e]}\nendobj\n`;let G=U.length,K=H.length+1;U+=`xref\n0 ${K}\n0000000000 65535 f \n`;for(let e of W)U+=`${String(e).padStart(10,`0`)} 00000 n \n`;U+=`trailer\n<< /Size ${K} /Root 1 0 R >>\nstartxref\n${G}\n%%EOF`;let q=new Uint8Array(U.length);for(let e=0;e<U.length;e++)q[e]=U.charCodeAt(e)&255;return q}function te(e){if(typeof window>`u`)return;let t=`Invoice-Sanubari-Roastery-${(e.customer_name||`Pelanggan`).replace(/[^a-zA-Z0-9_-]/g,`-`).replace(/-+/g,`-`).replace(/^-|-$/g,``)||`Pelanggan`}.pdf`;if((j()||/SanubariPOS-Android|wv|Android/i.test(navigator.userAgent||``))&&navigator.onLine)try{let n=JSON.stringify(e),r=A(new TextEncoder().encode(n)).replace(/\+/g,`-`).replace(/\//g,`_`).replace(/=+$/,``),i=`/pos/download-apk?invoice_pdf=1&payload=${encodeURIComponent(r)}`;if(/SanubariPOS-Android/i.test(navigator.userAgent||``)||j()){window.location.href=i;return}let a=document.createElement(`a`);a.href=i,a.download=t,document.body.appendChild(a),a.click(),document.body.removeChild(a);return}catch{}let n=ee(e),r=new Blob([n],{type:`application/pdf`}),i=URL.createObjectURL(r),a=document.createElement(`a`);a.href=i,a.download=t,a.style.display=`none`,document.body.appendChild(a),a.click(),document.body.removeChild(a),window.setTimeout(()=>{URL.revokeObjectURL(i)},1e4)}export{a as A,E as C,V as D,T as E,r as M,n as N,I as O,t as P,W as S,w as T,R as _,l as a,Y as b,H as c,y as d,N as f,M as g,v as h,o as i,i as j,L as k,G as l,j as m,B as n,X as o,x as p,C as r,Z as s,z as t,F as u,te as v,f as w,q as x,$ as y};