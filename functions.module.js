import { f_update_o_deviceDescriptor } from './localhost/functions.module.js';

let s_path_abs_file_current = new URL(import.meta.url).pathname;
let s_path_abs_folder_current = s_path_abs_file_current.split('/').slice(0, -1).join('/');



let f_b_deno = function(){
    let b_deno = false;
    if(typeof window !== 'undefined'){
        b_deno = "Deno" in window
    }
    return b_deno
}
let b_deno = f_b_deno();

let fs = (!b_deno) ? await import('fs') : null;
let readline = (!b_deno) ? await import('readline') : null;


let f_exit = function(){
  if(b_deno){
    return Deno.exit(...arguments)
  }else{
    return process.exit(...arguments)
  }
}

let f_write_text_file = async function(
    s_path, 
    s_content
){
    if(b_deno){
        return Deno.writeTextFile(s_path, s_content)
    }
    return fs.writeFileSync(s_path, s_content, 'utf8');
}
let f_read_text_file = async function(
    s_path
){
    if(b_deno){
        return Deno.readTextfile(s_path)
    }
    return fs.readFileSync(s_path, 'utf8');
}
let f_o_json_decoded_from_file = async function(
    s_path
){
    const s_json = await f_read_text_file(s_path);
    const o_config = JSON.parse(s_json);
    return o_config;
}
let f_write_o_json_encoded = async function(
    s_path, 
    v
){
    if(typeof v != 'string'){
        v = JSON.stringify(v, null, 4)
    }
    return f_write_text_file(s_path, v)
}

let f_s_input_from_cli = async function(s_leading_text){
    if(b_deno){
        return prompt(...arguments)
    }
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question(s_leading_text, (input) => {
            rl.close();
            resolve(input); // Resolve the promise with the input
        });
    });
}




let f_o_config = async function(){
    let s_json__o_config = await f_read_text_file(
        `${s_path_abs_folder_current}/o_config.gitignored.json`
    );
    return JSON.parse(s_json__o_config);
}

let f_update_device_info = async function(o_device){
    o_device.open()
    // console.log(o_device.interfaces)
    o_device.a_o_interface = o_device.interfaces.map(o_interface=>{
        f_update_o_deviceDescriptor(o_interface.descriptor)
        o_interface.a_o_endpoint = o_interface.endpoints.map(o_endpoint=>{
            f_update_o_deviceDescriptor(o_endpoint.descriptor)
            // console.log(o_endpoint)
            return o_endpoint
            // return {o_descriptor: o_endpoint.descriptor}
        })
        // console.log(o_interface)
        return o_interface
        // {
        //     a_o_endpoint: o_interface.a_o_endpoint,
        //     o_descriptor: o_interface.descriptor
        // }
    });
    
    let a_s = [
        'iManufacturer',
        'iProduct',
        'iSerialNumber',
        'idProduct',
        'idVendor',
    ]
    return new Promise((f_res, f_rej)=>{
        Promise.all(
            a_s.map(s=>{
                return new Promise((f_res, f_rej)=>{
                    return o_device.getStringDescriptor(o_device.deviceDescriptor[s], function(o_e, v){
                        o_device[`v_${s}`] = v
                        return f_res(o_device)
                    })  

                })
            })
        ).then(()=>{
            f_update_o_deviceDescriptor(o_device.deviceDescriptor)
            o_device.close()
            return f_res(o_device)
        })

    })
}


export { 
    f_o_config,
    f_write_text_file,
    f_read_text_file,
    f_o_json_decoded_from_file,
    f_write_o_json_encoded, 
    f_b_deno, 
    f_s_input_from_cli, 
    f_exit, 
    f_update_device_info
}