import { a_o_device_descriptor_enum } from "./runtimedata.module.js"

let f_s_first_letter_uppercase = function(s){
    return s.charAt(0).toUpperCase() + s.slice(1);
}
function f_n_from_string(s) {
    return parseInt(s.replace(/\D/g, ''), 10);
}
let f_s_string_from_device = function(o_device){
    let s_vendor_id_product_id = [
        o_device.deviceDescriptor.idVendor.toString(16),
        o_device.deviceDescriptor.idProduct.toString(16)
    ].join(':')
    return [
        // `${(n_idx+1).toString().padStart(2, ' ')} )`, 
        `Bus ${o_device.busNumber.toString().padStart(3, '0')}`, 
        `Dev ${o_device.deviceAddress.toString().padStart(3, '0')}`, 
        `vid:pid`, 
        [
            o_device.deviceDescriptor.idVendor.toString(16).padStart(4, '0'),
            o_device.deviceDescriptor.idProduct.toString(16).padStart(4, '0')
        ].join(':'),
        `${o_device.v_iManufacturer}`,
        `${o_device.v_iProduct}`

    ].join(' ')
}
let f_update_o_deviceDescriptor = function(o_deviceDescriptor){
    for(let s_prop in o_deviceDescriptor){
        let v_n_idx = o_deviceDescriptor[s_prop]
        let v_o_device_descriptor_enum = a_o_device_descriptor_enum.find(
            o=>{
                return (
                    o.n_idx == v_n_idx
                    && o.s_name__device_descriptor_property == s_prop
                )
            }   
        );
        if(v_o_device_descriptor_enum){
            o_deviceDescriptor[`o_device_descriptor_enum_${s_prop}`] = v_o_device_descriptor_enum
        }
    }
}
let f_s_json_prevent_circular = function(v){
    const o_weak_set = new WeakSet();
    let f_v_replacer_function =  function(s_prop, value){
        if (typeof value === "object" && value !== null) {
        if (o_weak_set.has(value)) {
            // Circular reference found, return a custom string or undefined
            return "[Circular]";
        }
        o_weak_set.add(value);
        }
        return value;
    };
    return JSON.stringify(v, f_v_replacer_function);
}

let f_update_o_input_device = function(
    o_input_device,
    a_n_u8
){
    let n_bit = 0
    let o_data_view = new DataView(a_n_u8.buffer);
    for (let n_idx in o_input_device.a_o_input_sensor){
        let o = o_input_device.a_o_input_sensor[n_idx]
        let n_idx_byte = parseInt(n_bit / 8) //# eg. 2
        let n_bits = f_n_from_string(o.s_type) //# for example 'u4' -> 4

        let s_name_function = [
            'get', 
            f_s_first_letter_uppercase(`${(o.s_type.includes('u') ? 'u': '')}int`),
            (Math.ceil(n_bits/8)*8).toString()
        ].join('');
        let b_little_endian = true;
        let n_value_number = o_data_view[
            s_name_function
        ](n_idx_byte, b_little_endian); 
        let n_idx_bit = n_bit % 8 //# eg. 4

        // console.log(
        //     `${n_idx_byte} ${s_name_function} ${n_value_number} ${n_idx_bit}`
        // )    
        let n_value_max = (Math.pow(2,n_bits)-1) //# eg. 2^4-1 = 16-1 = 15 => 0b1111
        if([8,16,32,64].includes(n_bits) == false){
            // todo , improve
            n_value_number = n_value_number >> (n_idx_bit) & n_value_max
        }
        if(o.s_type.includes('i')){
            n_value_max  = n_value_max /2
            //# n_value_byte -= n_value_max 
            // }
        } 

        o.value = n_value_number
        o.n_nor = n_value_number / n_value_max
        if(o.a_o_enum_value){
            // console.log(o.a_o_enum_value)
            o.o_enum_value = o.a_o_enum_value.find(
                o=>{
                    // console.log(o)
                    return o.n == n_value_number
                }
            )
        }
        n_bit+=n_bits
        let v = o.n_nor
        if(o.o_enum_value){
            v = o.o_enum_value.s
        }
        // console.log(
        //     `${o.s_name.toString().padStart(30, ' ')}: ${v}`
        // )
    }
}
export {
    f_s_string_from_device, 
    f_update_o_deviceDescriptor,
    f_s_json_prevent_circular, 
    f_update_o_input_device
}