import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import express from 'express';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { f_o_config, f_update_device_info } from './functions.module.js';
import {
    O_ws_client,
    O_enum_value,
    O_input_sensor,
    O_input_device
} from './localhost/classes.module.js';

import {
    s_padding_or_not_found_out_yet,
    o_input_device_shenzhen_shanwan_android_gamepad,
    a_o_input_device,
    a_o_enum_value__keys
}from "./localhost/runtimedata.module.js"
import {usb} from 'usb';
import { f_s_json_prevent_circular } from './localhost/functions.module.js';


// import {  
//Error [ERR_UNSUPPORTED_ESM_URL_SCHEME]: Only URLs with a scheme in: file, data are supported by the default ESM loader. Received protocol 'https:' 
// fuck you node js
//     f_sleep_ms
// } from "https://deno.land/x/handyhelpers@4.0/mod.js"

let o_state = {
    a_o_device : [], 
    o_device: null,
    o_interface__0: null, 
    o_endpoint__in: null
}

// console.log(endpoint.transferType)
let f_o_buffer_read_data = async function(
    o_endpoint__in
){
    return new Promise((f_res, f_rej)=>{
      o_endpoint__in.transfer(
          o_endpoint__in?.descriptor.wMaxPacketSize, (error, o_buffer) => {
        if (error) {
          console.error('Error reading from endpoint:', error);
          return f_rej(error)
        } else {
          // console.log('Data received:', data);
          return f_res(o_buffer)
        }
        return f_rej('none')
      });
    })
  }

  

let f_update_a_o_device = async function(){

    o_state.a_o_device = usb.getDeviceList()
    console.log('reading devices...')
    for(let o of o_state.a_o_device){
        o = await f_update_device_info(o)
        // console.log(o)
    }
    // console.log(o_state.a_o_device)
}
await f_update_a_o_device();

// Convert the URL to a file path
const __filename = fileURLToPath(import.meta.url);
// Get the directory name
const __dirname = path.dirname(__filename);

// Define the base path and client HTML path
const basePath = __dirname;
const clientHtmlPath = path.join(basePath, 'localhost/client.html');

let a_o_ws_client = [];

(async () => {
  let o_config = await f_o_config();
  console.log({ o_config });

  // Initialize Express
  const app = express();
  const port = 8080;

  // Assuming 'client.html' is in the 'localhost' directory within your project
const clientHtmlPath = path.join(__dirname, 'localhost', 'client.html');

  // Serve static files
  app.use(express.static('localhost'));

  app.get('/', (req, res) => {
    res.sendFile(clientHtmlPath);
  });

//   app.get('/a_o_device', (req, res) => {
//     res.json({
//         n: 2
//     })
//   });

  // Create an HTTP server from the Express app
  const server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });

  const wss = new WebSocketServer({ noServer: true });

  wss.on('connection', function connection(ws) {
    const o_ws_client = new O_ws_client(uuidv4(), ws);
    a_o_ws_client.push(o_ws_client);
    let s_json = f_s_json_prevent_circular(
      {a_o_device: o_state.a_o_device}, 
    )
    o_ws_client.o_socket.send(s_json)
    ws.on('message', async function incoming(s_msg) {
      console.log('received: %s', s_msg);
      let o = JSON.parse(s_msg);
      if(o.o_device){

        let o_device = o_state.a_o_device.find(
            o2=>{
                return o2.deviceDescriptor.idProduct == o.o_device.deviceDescriptor.idProduct 
                    && o2.deviceDescriptor.idVendor == o.o_device.deviceDescriptor.idVendor 
            }
        );
        if(!o_device){
            ws.send(JSON.stringify({
                s_error: `can not find device ${o.o_device} maybe usb has been unplugged in the meantime `
            }))
            return
        }
        // device has ben changed in the GUI
        if(o_state.o_device){
            await (new Promise((f_res)=>{
                o_state.o_interface__0.release(() => {
                    console.log('Interface released successfully.');
            
                    // Check if you detached the kernel driver earlier, and if so, reattach it.
                    // This is typically necessary only if you detached it manually in your code.
                    o_state.o_interface__0.attachKernelDriver();
                    // if (o_state.o_interface__0.isKernelDriverActive() === false) {
                    //     console.log('Kernel driver reattached.');
                    // }
            
                    // Finally, close the device. This might also need to handle asynchronously,
                    // so check if you need to use a callback or a promise depending on your library.
                    o_state.o_device.close();
                    console.log('Device closed.');
                    return f_res(true);
                });
            }))
        }

        console.log('trying to open device ')
        console.log(o_device)
        o_state.o_device = o_device
        o_state.o_device.open();
        o_state.o_interface__0 = o_state.o_device.interface(0);
        if (o_state.o_interface__0.isKernelDriverActive()) {
            o_state.o_interface__0.detachKernelDriver()
        }
        o_state.o_interface__0.claim();
        o_state.o_endpoint__in = o_state.o_interface__0.endpoints.find(o=>o.direction == 'in');
        // console.log(o_state.o_endpoint__in)
      }
        //   // Broadcast to all clients except the sender
        //   a_o_ws_client.filter(o => o.uuid !== o_ws_client.uuid).forEach(o => {
        //     o.ws.send('message was received from a client');
        //   });
    });

    ws.on('close', function close() {
      // Remove the client from the array
      const index = a_o_ws_client.indexOf(o_ws_client);
      if (index > -1) {
        a_o_ws_client.splice(index, 1);
      }
    });
  });

  // Attach WebSocket server to the same HTTP server
  server.on('upgrade', function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  });
})();

let f_sleep_ms = async function(n_ms){
    return new Promise((f_res)=>{
        setTimeout(()=>{
            return f_res(true)
        },n_ms)
    })
}
while (true){
    await f_sleep_ms(24);
    // console.log(o_state)
    if(
        o_state.o_device
        && o_state.o_interface__0 
        && o_state.o_endpoint__in
        ){

            // f_clear_terminal()
        
            let o_buffer = await f_o_buffer_read_data(o_state.o_endpoint__in);
            for(let n_idx = 0; n_idx < o_buffer.byteLength; n_idx+=1){
                let n_byte_value = o_buffer[n_idx];
                // console.log(n_byte_value)
                console.log(`${n_idx.toString().padStart(3, '0')}: ${n_byte_value.toString(2).padStart(8,'0')}`)
            }
            for(let o of a_o_ws_client){
                o.o_socket.send(
                    JSON.stringify({
                        o_buffer__endpoint__in_data: o_buffer
                    })
                )
            }
        
            // if(!o_input_device?.a_o_input_sensor){
            //     console.log('no button-bit-assignment found :( !')
            //     console.log('please createa a "O_input_device" in ./runtimedata.module.js for this device!')
            // }
            // if(o_input_device?.a_o_input_sensor){
        
            //     let n_bit = 0
            //     let o_data_view = new DataView(a_n_u8.buffer);
            //     for (let n_idx in o_input_device.a_o_input_sensor){
            //         let o = o_input_device.a_o_input_sensor[n_idx]
            //         let n_idx_byte = parseInt(n_bit / 8) //# eg. 2
            //         let n_bits = f_n_from_string(o.s_type) //# for example 'u4' -> 4
            
            //         let s_name_function = [
            //             'get', 
            //             f_s_first_letter_uppercase(`${(o.s_type.includes('u') ? 'u': '')}int`),
            //             (Math.ceil(n_bits/8)*8).toString()
            //         ].join('');
            //         let b_little_endian = true;
            //         let n_value_number = o_data_view[
            //             s_name_function
            //         ](n_idx_byte, b_little_endian); 
            //         let n_idx_bit = n_bit % 8 //# eg. 4
            
            //         // console.log(
            //         //     `${n_idx_byte} ${s_name_function} ${n_value_number} ${n_idx_bit}`
            //         // )    
            //         let n_value_max = (Math.pow(2,n_bits)-1) //# eg. 2^4-1 = 16-1 = 15 => 0b1111
            //         if([8,16,32,64].includes(n_bits) == false){
            //             // todo , improve
            //             n_value_number = n_value_number >> (n_idx_bit) & n_value_max
            //         }
            //         if(o.s_type.includes('i')){
            //             n_value_max  = n_value_max /2
            //             //# n_value_byte -= n_value_max 
            //             // }
            //         } 
            
            //         o.value = n_value_number
            //         o.n_nor = n_value_number / n_value_max
            //         if(o.a_o_enum_value){
            //             console.log(o.a_o_enum_value)
            //             o.o_enum_value = o.a_o_enum_value.find(
            //                 o=>{
            //                     console.log(o)
            //                     return o.n == n_value_number
            //                 }
            //             )
            //         }
            //         n_bit+=n_bits
            //         let v = o.n_nor
            //         if(o.o_enum_value){
            //             v = o.o_enum_value.s
            //         }
            //         console.log(
            //             `${o.s_name.toString().padStart(30, ' ')}: ${v}`
            //         )
            //     }
            // }
        
            // if(false){
        
            //     let n_nor_l_y = o_input_device.a_o_input_sensor.find(
            //         o=>o.s_name == 'left_y_axis'
            //     )?.n_nor
            
            //     let n_nor_r_y = o_input_device.a_o_input_sensor.find(
            //         o=>o.s_name == 'right_y_axis'
            //     )?.n_nor
            //     if(
            //         o_input_device.n_id_product == 0x028e
            //         && o_input_device.n_id_vendor == 0x045e
            //     ){
            //         n_nor_l_y = (n_nor_l_y-.5)*2.
            //         n_nor_r_y = (n_nor_r_y-.5)*2.
            //     }
            //     // n_nor_l_y = n_nor_l_y *.5 + .5
            //     // n_nor_r_y = n_nor_r_y *.5 + .5
            //     // console.log(n_nor_l_y)
            //     // console.log(n_nor_r_y)
            //     n_idx_now= (n_idx_now +1 )
            //     let a_n_u8_send = new Uint8Array(
            //         new Array(8).fill(0).map(
            //             (n, n_idx)=>{
            //                 return 0//n_idx_now%255;
            //                 // return 255
            //                 // if(n_idx == n_idx_now){
            //                 //     return 255
            //                 // }
            //                 // return 0
            //             }
            //         )
            //     )
            //     let n_nor = (n_idx_now%255)/255
            //     // console.log({n_nor})
            //     let n_int = n_idx_now%255
            //     let b = (n_idx_now%512) < 255
            //     a_n_u8_send[0] = (n_nor_l_y *8)// rumble is on
            //     a_n_u8_send[1] = 0 // padding or none ? 
            //     a_n_u8_send[3] = n_nor_r_y*255 // padding or none ? 
            //     // a_n_u8_send[2] = 120// padding or none?
            //     // let o_data_view2 = new DataView(a_n_u8_send.buffer);
            //     // o_data_view2.setUint32(2, (Math.pow(2,32)-1)*n_nor//(n_nor-.5), 
            //     // ,false)
            //     // a_n_u8_send[2] = 0
            //     // a_n_u8_send[2] = 0//(n_idx_now/255)//255-(n_idx_now%255) // rubmle left motor intensity?
            //     // a_n_u8_send[2] = 0//n_idx_now%255 // rubmle left motor intensity?
            //     // a_n_u8_send[4] = 0// rubmle right motor intensity?
            //     // a_n_u8_send[6] = 0//(b) ? n_idx_now%255 : 0// rubmle right motor intensity?
            //     // a_n_u8_send[7] = 0//(b) ? n_idx_now%255 : 0// rubmle right motor intensity?
            //     // a_n_u8_send[0] = 0 // rumble is off
            
            //     console.log(a_n_u8_send)
            //     await f_send_data(
            //         // new Uint8Array(
            //         //     [
            //         //         // 0x00,
            //         //         // 0x00, // some kind of mode or something...
            //         //         // 0x00,
            //         //         parseInt(Math.random()*255),//parseInt(n_nor_l_y*255),//0xff,//left motor 
            //         //         parseInt(Math.random()*255),//parseInt(n_nor_l_y*255),//0xff,//left motor 
            //         //         parseInt(Math.random()*255),//parseInt(n_nor_l_y*255),//0xff,//left motor 
            //         //         parseInt(Math.random()*255),//parseInt(n_nor_l_y*255),//0xff,//left motor 
            //         //         parseInt(Math.random()*255),//parseInt(n_nor_r_y*255),//0xff,//right motor
            //         //         parseInt(Math.random()*255),//parseInt(n_nor_r_y*255),//0xff,//right motor
            //         //         parseInt(Math.random()*255),//parseInt(n_nor_r_y*255),//0xff,//right motor
            //         //         parseInt(Math.random()*255),//parseInt(n_nor_r_y*255),//0xff,//right motor
            //         //         // 0x00,
            //         //         // 0x00,
            //         //         // 0x00
            //         //     ]
            //         // )
            //         a_n_u8_send
            //     );
            // }
        
            // await new Promise((f_res)=>{
            //     setTimeout(()=>{return f_res(true)},100)
            // })
        
        
    }
  }