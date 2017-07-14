/**
 * Created by mannam4 on 7/5/2017.
 */

module.exports = {

  general:{
    create_file: 'touch "%s"',
    read_file: 'cat "%s"',
    remove_file: 'rm -rf "%s"',
    list_folder_contents: 'ls "%s"',
    check_dir_exists: '[ -d "%s" ]',
    check_dir_not_exists: '[ ! -d "%s" ]',
    archive_folder: 'mkdir -p %s && tar -cvf "%s/%s.tar" "%s" && rm -rf "%s"',
    list_roles_files_json: 'cd "%s/roles/%s"; python /tmp/dir_tree.py',
    list_files_json: 'cd "%s"; python /tmp/dir_tree.py'
  },
  ansible:{
    version : 'ansible --version',
    doc:      'ansible-doc -l',
    playbook: 'ansible-playbook "%s" -i %s',
    export_ansible_library: 'export ANSIBLE_LIBRARY="%s";',
    export_force_color: 'export ANSIBLE_FORCE_COLOR=%s;',
    export_host_key_check: 'export ANSIBLE_HOST_KEY_CHECKING=%s;',
    get_inventory_list: 'cd "%s" ; ls --ignore="*.*" -p | grep -v /',
    get_vars: 'cd "%s"; python %s host_vars --inventory_file="%s" ',
    get_role_vars: 'cd "%s"; python "%s" role_vars --playbook_path="%s" ',
    get_playbook_list: 'ls "%s" | grep .yml',
    create_ansible_project_folder: 'mkdir -p "%s"; mkdir -p "%s"',
    create_role: 'cd "%s"; ansible-galaxy init "%s"',
    copy_role: 'cd "%s/roles"; cp -r "%s" "%s"; rm -rf "%s/.git"',
    delete_role: 'rm -rf "%s/roles/%s"',
    list_tags: 'cd "%s"; python2.7 /tmp/list_tasks_json.py "%s" -i "%s" --list-hosts  --list-tasks-json ',
    ansible_galaxy_search: 'ansible-galaxy search %s',
    ansible_galaxy_install: 'ansible-galaxy install %s -p %s',
    github_search_api_options: {
      host: 'api.github.com',
      path: '/search/repositories?q=ansible-role-%s',
      headers: {'user-agent': 'node.js'}
    },
    git_clone_repo: 'git clone "%s"'
  }

};
