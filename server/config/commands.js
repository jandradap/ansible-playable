/**
 * Created by mannam4 on 7/5/2017.
 */

module.exports = {

  ansible:{
    version : 'ansible --version',
    doc:      'ansible-doc -l',
    playbook: 'ansible-playbook %s -i %s',
    export_ansible_library: 'export ANSIBLE_LIBRARY="%s";',
    export_force_color: 'export ANSIBLE_FORCE_COLOR=%s;',
    export_host_key_check: 'export ANSIBLE_HOST_KEY_CHECKING=%s;',

  }

};
