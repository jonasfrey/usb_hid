
import {
    f_add_css,
    f_s_css_prefixed,
    o_variables, 
    f_s_css_from_o_variables
} from "https://deno.land/x/f_add_css@1.1/mod.js"

import {
    f_o_html__and_make_renderable,
}
from 'https://deno.land/x/f_o_html_from_o_js@3.0/mod.js'
import { f_s_string_from_device, f_update_o_input_device } from "./functions.module.js";
import { a_o_input_device, o_usb_device_type__gamepad } from "./runtimedata.module.js";
import { O_input_device, O_input_sensor } from "./classes.module.js";


o_variables.n_rem_font_size_base = 1. // adjust font size, other variables can also be adapted before adding the css to the dom
o_variables.n_rem_padding_interactive_elements = 0.5; // adjust padding for interactive elements 
f_add_css(
    `
    body{
        min-height: 100vh;
        min-width: 100vw;
        /* background: rgba(0,0,0,0.84);*/
        display:flex;
        justify-content:center;
    }
    canvas{
        width: 100%;
        height: 100%;
        position:fixed;
        z-index:-1;
    }
    .app{
        max-width: 1000px;
        width:100%;
        height: 100vh;
        display:flex;
        flex-direction: column;
        justify-content:flex-end;
    }
    .n_nor_bar{
        position:relative;
        background: grey;
    }
    .n_nor_bar.y{
        height: 100%;
        width: 1rem;
    }
    .n_nor_bar.y .value{
        position:absolute;
        width:100%;
        background: white;
    }
    .n_nor_bar.x{
        height: 1rem;
        width: 100%;
    }
    .n_nor_bar.x .value{
        position:absolute;
        height:100%;
        background: white;
    }
    ${
        f_s_css_from_o_variables(
            o_variables
        )
    }
    `

);


// let n_id_raf = 0;
// let f_raf = function(){
//     console.log('f_raf')
// }
// n_id_raf = window.requestAnimationFrame(f_raf);

// Determine the current domain
const s_hostname = window.location.hostname;

// Create the WebSocket URL, assuming ws for http and wss for https
const s_protocol_ws = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const s_url_ws = `${s_protocol_ws}//${s_hostname}:${window.location.port}`;

// Create a new WebSocket instance
const o_ws = new WebSocket(s_url_ws);

// Set up event listeners for your WebSocket
o_ws.onopen = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onopen called'
    })
};

o_ws.onerror = function(o_e) {
    console.log({
        o_e, 
        s: 'o_ws.onerror called'
    })
};

o_ws.onmessage = function(o_e) {
    // console.log(o_e)
    let o = JSON.parse(o_e.data);
    // console.log(o)
    if(o.a_o_device){
        o_state.a_o_device = o.a_o_device.sort(
            (o1,o2)=>{
                let s1 = (o1?.deviceDescriptor?.o_device_descriptor_enum_bDeviceClass?.s_name__enum_value) //? : ''
                let s2 = (o2?.deviceDescriptor?.o_device_descriptor_enum_bDeviceClass?.s_name__enum_value) //? : ''
                return s1?.localeCompare(s2)
            }
        )
        o_state?.o_js__a_o_mod?._f_render();
        o_state?.o_js__a_o_interface?._f_render();
        o_state?.o_js__a_o_endpoint?._f_render();
        o_state?.o_js__o_endpoint__in._f_render()

    }
    if(o.o_buffer__endpoint__in_data){
        o_state.n_buffer_update +=1;
        // console.log(o.o_buffer__endpoint__in_data.data)
        o_state.o_buffer__endpoint__in_data = o.o_buffer__endpoint__in_data
        o_state?.o_js__o_buffer__endpoint__in_data._f_render()
        if(o_state.o_input_device){
            f_update_o_input_device(
                o_state.o_input_device, 
                new Uint8Array(o.o_buffer__endpoint__in_data.data)
            )
            for(let o_input_sensor of o_state.o_input_device.a_o_input_sensor){
                if(!o_input_sensor.a_n_nor){
                    o_input_sensor.a_n_nor = new Array(o_state.n_len_history)
                }
                o_input_sensor.a_n_nor[o_state.n_buffer_update%o_state.n_len_history] = o_input_sensor.n_nor;
            }
            o_state?.o_js__o_input_device._f_render()
        }
    }


};

// To close the WebSocket
// o_ws.close();

let o_state = {
    n_buffer_update: 0,
    s_msg: '', 
    n_len_history: 50,
    a_o_input_device: a_o_input_device,
    o_input_device: null,
    a_o_device: [], 
    o_device: null,
    a_interface: [], 
    interface: null,
    a_o_endpoint: [], 
    o_endpoint: null,
    o_buffer__endpoint__in_data: null,
}

window.o_state = o_state

window.addEventListener('pointermove', (o_e)=>{

})

// //readme.md:start
document.body.appendChild(
    await f_o_html__and_make_renderable(
        {
            s_tag: 'div', 
            class: "app",
            a_o: [
                Object.assign(
                    o_state, 
                    {
                        o_js__o_input_device: {
                            f_o_jsh: ()=>{
                                if(!o_state.o_input_device){
                                    return {
                                        b_render: false
                                    }
                                }
                                return {
                                    a_o: [
                                        {
                                            innerText: "O_input_device:"
                                        },
                                        {
                                            s_tag: "label",
                                            innerText: 'name'
                                        },
                                        {
                                            s_tag: 'input', 
                                            value: o_state.o_input_device.s_name, 
                                            oninput: (o_e)=>{o_state.o_input_device.s_name = o_e.target.value}
                                        },
                                        {
                                            s_tag: "label",
                                            innerText: 'n_id_vendor:n_id_product'
                                        },
                                        {
                                            s_tag: 'input', 
                                            value: [o_state.o_input_device.n_id_vendor, o_state.o_input_device.n_id_product].join(':'), 
                                            readonly: 'true'
                                        },
                                        {
                                            s_tag: "label",
                                            innerText: 'a_o_input_sensor'
                                        },
                                        {
                                            class: 'a_o_input_sensor', 
                                            style: 'display:flex;flex-direction:column',
                                            a_o: [
                                                {
                                                    a_o: [
                                                        {
                                                            s_tag: "label",
                                                            innerText: `name`
                                                        },
                                                        {
                                                            s_tag: "label",
                                                            innerText: `data type ['u' or 'i'][number of bits]`
                                                        },
                                                        {
                                                            s_tag: "label",
                                                            innerText: `a_o_enum_value`
                                                        },
                                                        {
                                                            s_tag: "label",
                                                            innerText: `value`
                                                        },
                                                        {
                                                            s_tag: "label",
                                                            innerText: `n_nor (normalized value)`
                                                        },
                                                    ]
                                                }, 
                                                {
                                                    a_o:o_state.o_input_device.a_o_input_sensor.map(o=>{
                                                        return {
                                                            class: "hoverable o_input_sensor",
                                                            a_o: [
                                                                {
                                                                    class: 'svg',
                                                                    s_tag: "svg",
                                                                    // width: 1000, 
                                                                    // height: 100, 
                                                                    style: 'height: 100px !important; width: 1000px;',
                                                                    TiSisATeSt: '1',
                                                                    viewBox:"0 0 1000 100",
                                                                    a_o: [
                                                                        {
                                                                            s_tag: 'polyline', 
                                                                            fill: 'none', 
                                                                            stroke: 'red', 
                                                                            'stroke-width':'3', 
                                                                            points: 
                                                                            o.a_n_nor.map(
                                                                                    (n_nor, n_idx)=>{
                                                                                        let n_idx_new = ((n_idx+o_state.n_buffer_update)%o_state.n_len_history);
                                                                                        let n_val = o.a_n_nor[n_idx_new];
                                                                                        return [
                                                                                            (n_idx/o_state.n_len_history)*1000, 
                                                                                            (0.5+(n_val*.5))*100
                                                                                        ].join(',')
                                                                                    }
                                                                            ).join(' ')
                                                                        }
                                                                    ] 

                                                                },
                                                                {
                                                                    class: "n_nor_bar x",
                                                                    a_o: [
                                                                        {
                                                                            style: 
                                                                            [
                                                                                `width: ${Math.abs(o.n_nor)*50}%`,
                                                                                `left: ${(1.+Math.min(o.n_nor,0))*50}%`
                                                                            ].join(';'),
                                                                            class: "value"
                                                                        }
                                                                    ] 
                                                                },
                                                                {
                                                                    s_tag: 'input', 
                                                                    value: o.s_name, 
                                                                    oninput: (o_e)=>{o.s_name = o_e.target.value}, 
                                                                    class: "s_name"
                                                                },
        
                                                                {
                                                                    s_tag: 'input', 
                                                                    value: o.s_type, 
                                                                    oninput: (o_e)=>{o.s_type = o_e.target.value}, 
                                                                    class: "s_type"
                                                                },
        
                                                                {
                                                                    s_tag: 'input', 
                                                                    value: JSON.stringify(o.a_o_enum_value), 
                                                                    oninput: (o_e)=>{
                                                                        o.a_o_enum_value = JSON.parse(o_e.target.value)
                                                                    },
                                                                    class: "a_o_enum_value"
                                                                },
        
                                                                {
                                                                    s_tag: 'input', 
                                                                    value: o.value, 
                                                                    readonly: 'true',
                                                                    class: "value"

                                                                },
        
                                                                {
                                                                    s_tag: 'input', 
                                                                    value: o.n_nor, 
                                                                    readonly: 'true',
                                                                    class: "n_nor"

                                                                },
                                                            ]
        
                                                        }
                                                    })
                                                }
                                            ]
                                        }

                                    ]
                                    
                                }
                            }
                        }
                    }
                ).o_js__o_input_device,

                Object.assign(
                    o_state, 
                    {
                        o_js__a_o_mod: {
                            f_o_jsh: ()=>{
                                return {
                                    a_o: [
                                        {
                                            innerText: "Devices:"
                                        },
                                        {
                                            class: "a_o_device",
                                            s_tag: "select", 
                                            a_o: [
                                                ...o_state.a_o_device.map(o=>{
                                                    return {
                                                        s_tag: "option", 
                                                        value: `${o.deviceDescriptor.idVendor}:${o.deviceDescriptor.idProduct}`,
                                                        style: [
                                                            'display:flex',
                                                            'flex-direction:row',
                                                            `justify-content: ${(o.s_uuidv4 == o_state.s_uuidv4) ? 'end' : 'start'}`,
                                                            'align-items:end'
                                                        ].join(';'),

                                                        innerText:[
                                                            `${o?.deviceDescriptor?.o_device_descriptor_enum_bDeviceClass?.s_name__enum_value}`,
                                                            f_s_string_from_device(o)
                                                        ].join(' - ') 

                                                    }
                                                })
                                            ], 
                                            onchange: (o_e)=>{
                                                let s = o_e.target.value; 
                                                let [n_id_vendor, n_id_product] = s.split(":");
                                                let o_device = o_state.a_o_device.find(
                                                    o=>{
                                                        return o.deviceDescriptor.idProduct == parseInt(n_id_product)
                                                        && o.deviceDescriptor.idVendor == parseInt(n_id_vendor)
                                                    }
                                                );
                                                o_state.o_input_device = o_state.a_o_input_device.find(
                                                    o=>{
                                                        return (
                                                            o.n_id_product == o_device.deviceDescriptor.idProduct
                                                            &&
                                                            o.n_id_vendor == o_device.deviceDescriptor.idVendor
                                                        )
                                                    }
                                                )
                                                if(!o_state.o_input_device){
                                                    // no input device found, the user can reverse engeneer / create the device
                                                    o_state.o_input_device = new O_input_device(
                                                        'device_name',
                                                        o_device.idVendor,
                                                        o_device.idProduct,
                                                        o_usb_device_type__gamepad,
                                                        [
                                                            new O_input_sensor(
                                                                'u1', 
                                                                'button_1'
                                                            ),
                                                            new O_input_sensor(
                                                                'u8', 
                                                                'axis_1'
                                                            )
                                                        ]

                                                    )
                                                }
                                                o_state.o_device = o_device
                                                o_state.o_interface = o_state?.o_device?.interfaces?.[0]
                                                if(o_state?.o_interface){
                                                    o_state.o_endpoint = o_state.o_interface.endpoints[0];
                                                } 
                                                o_ws.send(
                                                    JSON.stringify(
                                                        {
                                                            o_device: o_device
                                                        }
                                                    )
                                                )
                                            }
                                        }
                                    ]
                                    
                                }
                            }
                        }
                    }
                ).o_js__a_o_mod,

                Object.assign(
                    o_state, 
                    {
                        o_js__a_o_interface: {
                            f_o_jsh: ()=>{
                                return {
                                    a_o: [
                                        {
                                            innerText: "Interfaces:"
                                        },
                                        {
                                            class: "a_o_device",
                                            s_tag: "select", 
                                            a_o: o_state?.o_device?.interfaces?.map((o,n_idx)=>{
                                                    return {
                                                        s_tag: "option", 
                                                        value: `${n_idx}`,
                                                        style: [
                                                            'display:flex',
                                                            'flex-direction:row',
                                                            `justify-content: ${(o.s_uuidv4 == o_state.s_uuidv4) ? 'end' : 'start'}`,
                                                            'align-items:end'
                                                        ].join(';'),

                                                        innerText:[
                                                            `${JSON.stringify(o, null, 4)}`,
                                                        ].join(' - ')

                                                    }
                                                })
                                            , 
                                            onchange: (o_e)=>{
                                                let v = parseInt(o_e.target.value); 
                                                o_state.o_interface = o_state?.o_device?.interfaces[v]
                                                o_ws.send(
                                                    JSON.stringify(
                                                        {
                                                            o_interface: o_state.o_interface
                                                        }
                                                    )
                                                )
                                            }
                                        }
                                    ]
                                    
                                }
                            }
                        }
                    }
                ).o_js__a_o_interface,

                Object.assign(
                    o_state, 
                    {
                        o_js__a_o_endpoint: {
                            f_o_jsh: ()=>{
                                return {
                                    a_o: [
                                        {
                                            innerText: "Endpoints:"
                                        },
                                        {
                                            class: "a_o_device",
                                            s_tag: "select", 
                                            a_o: o_state.o_interface?.endpoints?.map?.((o,n_idx)=>{
                                                    return {
                                                        s_tag: "option", 
                                                        value: `${n_idx}`,
                                                        style: [
                                                            'display:flex',
                                                            'flex-direction:row',
                                                            `justify-content: ${(o.s_uuidv4 == o_state.s_uuidv4) ? 'end' : 'start'}`,
                                                            'align-items:end'
                                                        ].join(';'),

                                                        innerText:[
                                                            `${JSON.stringify(o, null, 4)}`,
                                                        ].join(' - ')

                                                    }
                                                })
                                            , 
                                            onchange: (o_e)=>{
                                                let v = parseInt(o_e.target.value); 
                                                o_state.o_endpoint = o_state.o_interface?.endpoints[v]
                                                o_ws.send(
                                                    JSON.stringify(
                                                        {
                                                            o_endpoint: o_state.o_endpoint
                                                        }
                                                    )
                                                )
                                            }
                                        }
                                    ]
                                    
                                }
                            }
                        }
                    }
                ).o_js__a_o_endpoint,
                Object.assign(
                    o_state, 
                    {
                        o_js__o_endpoint__in: {
                            f_o_jsh: ()=>{
                                let o_date = new Date();
                                let s_date = [
                                    o_date.toString().split('GMT').shift(), 
                                    o_date.getMilliseconds()
                                ].join(".")
                                new Date()
                                return {
                                    a_o: [
                                        {
                                            innerText: [
                                                `Endpoint`, 
                                                `${o_state?.o_endpoint?.direction}`,
                                                `0x${o_state?.o_endpoint?.address.toString(16)}`,
                                            ].join(' - ')
                                        },
                                        {
                                            innerText: s_date
                                        }, 
                                        Object.assign(
                                            o_state, 
                                            {
                                                o_js__o_buffer__endpoint__in_data: {
                                                    f_o_jsh: ()=>{
                                                        return {
                                                            class: "o_byte",
                                                            a_o: o_state?.o_buffer__endpoint__in_data?.data.map(
                                                                (n_byte_value, n_idx)=>{
                                                                    return {
                                                                        innerText: `${n_idx.toString().padStart(2,'0')} - ${n_byte_value.toString(2).padStart(8, '0')}`
                                                                    }
                                                                }
                                                            )
                                                        }
                                                    }
                                                }
                                            }
                                        ).o_js__o_buffer__endpoint__in_data
                                        
                                    ]
                                }
                            }
                        }
                    }
                ).o_js__o_endpoint__in,
            ]
        }
    )
);
// //readme.md:end