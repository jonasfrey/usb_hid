class O_device_descriptor_enum{
    constructor(
        s_name__device_descriptor_property, 
        s_name__enum_value, 
        n_idx, 
        s_descriptor_usage, 
        s_description
    ){
        this.s_name__device_descriptor_property = s_name__device_descriptor_property
        this.s_name__enum_value = s_name__enum_value
        this.n_idx = n_idx
        this.s_descriptor_usage = s_descriptor_usage
        this.s_description = s_description
    }
} 
class O_ws_client{
    constructor(
        s_uuidv4,
        o_socket
    ){
        this.s_uuidv4 = s_uuidv4
        this.o_socket = o_socket
    }
}
// Define your classes
class O_enum_value {
    constructor(n, s, s_comment) {
        this.n = n;
        this.s = s;
        this.s_comment = s_comment;
    }
}

class O_input_sensor {
    constructor(s_type, s_name, a_o_enum_value = null) {
        this.s_type = s_type;
        this.s_name = s_name;
        this.a_o_enum_value = a_o_enum_value;
        this.value = 0;
        this.o_enum_value = null;
        this.n_nor = 0;
    }
}
class O_usb_device_type{
    constructor(
        s_name, 
        s_emoji_icon
    ){
        this.s_name = s_name
        this.s_emoji_icon = s_emoji_icon
    }
}
class O_input_device {
    constructor(
        s_name,
         n_id_vendor,
         n_id_product,
         o_usb_device_type,
         a_o_input_sensor
        ) {
        this.s_name = s_name;
        this.n_id_vendor = n_id_vendor;
        this.n_id_product = n_id_product;
        this.o_usb_device_type = o_usb_device_type
        this.a_o_input_sensor = a_o_input_sensor;
    }
}

export {
    O_ws_client,
    O_enum_value,
    O_input_sensor,
    O_input_device,
    O_device_descriptor_enum, 
    O_usb_device_type
}