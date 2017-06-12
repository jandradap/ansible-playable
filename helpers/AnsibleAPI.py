#!/usr/bin/env python

import os
import sys
import stat
from collections import namedtuple

from ansible.cli import CLI
from ansible.parsing.dataloader import DataLoader
from ansible.inventory import Inventory
from ansible.executor.playbook_executor import PlaybookExecutor
from ansible.playbook import Playbook

from ansible.playbook.block import Block
from ansible.playbook.play_context import PlayContext
from ansible.utils.vars import load_extra_vars
from ansible.utils.vars import load_options_vars
from ansible.vars import VariableManager

import optparse

import json
import argparse

parser = None

def host_vars():
    parser.add_argument('--inventory_file', help='Inventory Filename', required=True)
    parser.add_argument('--host_name', help='Host or Group name', required=True)
    args= parser.parse_args()

    variable_manager = VariableManager()
    loader = DataLoader()

    inventory = Inventory(loader=loader, variable_manager=variable_manager, host_list=args.inventory_file)
    result = None
    if args.host_name in variable_manager.__getstate__()['host_vars_files']:
        result = variable_manager.__getstate__()['host_vars_files'][args.host_name]
    elif args.host_name in variable_manager.__getstate__()['group_vars_files']:
        result = variable_manager.__getstate__()['group_vars_files'][args.host_name]
    elif args.host_name:
        sys.stderr.write('\nHost %s not found in host vars or group vars files' % args.host_name)
        sys.exit(1)

    print(json.dumps(result))


def play_vars():
    parser.add_argument('--playbook_path', help='Playbook path', required=True)
    parser.add_argument('--play_name', help='Play Name', required=True)
    args = parser.parse_args()

    variable_manager = VariableManager()
    loader = DataLoader()

    # host12_vars = variable_manager.get_vars(loader=loader, host=inventory.parser.groups[args.host_name])

    playbook_path = args.playbook_path

    if not os.path.exists(playbook_path):
        print('[ERROR] The playbook does not exist')
        sys.exit()
    #
    # Options = namedtuple('Options', ['listtags', 'listtasks', 'listhosts', 'syntax', 'connection','module_path', 'forks', 'remote_user', 'private_key_file', 'ssh_common_args', 'ssh_extra_args', 'sftp_extra_args', 'scp_extra_args', 'become', 'become_method', 'become_user', 'verbosity', 'check'])
    # options = Options(listtags=False, listtasks=False, listhosts=False, syntax=False, connection='ssh', module_path=None, forks=100, remote_user='slotlocker', private_key_file=None, ssh_common_args=None, ssh_extra_args=None, sftp_extra_args=None, scp_extra_args=None, become=True, become_method=None, become_user='root', verbosity=None, check=False)
    #
    # # variable_manager.extra_vars = {'hosts': 'mywebserver'} # This can accomodate various other command line arguments.`
    #
    # passwords = {}
    #
    pb = Playbook.load(playbook_path, variable_manager=variable_manager, loader=loader)
    plays = pb.get_plays()
    for play in plays:
        if play._included_path is not None:
            loader.set_basedir(play._included_path)
        else:
            loader.set_basedir(pb._basedir)
        result = variable_manager.get_vars(loader=loader, play=play)

    # pbex = PlaybookExecutor(playbooks=[playbook_path], inventory=inventory, variable_manager=variable_manager, loader=loader, options=options, passwords=passwords)

    # results = pbex.run()

    print(json.dumps(result))

def role_vars():
    parser.add_argument('--playbook_path', help='Test Playbook path for role - usually role/tests/test.yml', required=True)
    parser.add_argument('--vault_password_file', help='Vault password file - usually role/tests/test.yml', required=True)
    args = parser.parse_args()

    variable_manager = VariableManager()
    loader = DataLoader()

    if args.vault_password_file:
        # read vault_pass from a file
        vault_pass = CLI.read_vault_password_file(args.vault_password_file, loader=loader)
        loader.set_vault_password(vault_pass)

    playbook_path = args.playbook_path

    if not os.path.exists(playbook_path):
        print('[ERROR] The playbook does not exist')
        sys.exit(1)

    pb = Playbook.load(playbook_path, variable_manager=variable_manager, loader=loader)
    plays = pb.get_plays()

    if len(plays) == 0:
        print('[ERROR] No plays in playbook')
        sys.exit(1)

    first_play = plays[0]
    if first_play._included_path is not None:
        loader.set_basedir(first_play._included_path)
    else:
        loader.set_basedir(pb._basedir)

    result = dict()
    for role in first_play.roles:
        result.update(role.get_default_vars())
        result.update(role.get_vars())

    print(json.dumps(result))


def parse(self):
    # create parser for CLI options
    parser = CLI.base_parser(
        usage="%prog playbook.yml",
        connect_opts=True,
        meta_opts=True,
        runas_opts=True,
        subset_opts=True,
        check_opts=True,
        inventory_opts=True,
        runtask_opts=True,
        vault_opts=True,
        fork_opts=True,
        module_opts=True,
    )

    # ansible playbook specific opts
    parser.add_option('--list-tasks', dest='listtasks', action='store_true',
                      help="list all tasks that would be executed")
    parser.add_option('--list-tags', dest='listtags', action='store_true',
                      help="list all available tags")
    parser.add_option('--step', dest='step', action='store_true',
                      help="one-step-at-a-time: confirm each task before running")
    parser.add_option('--start-at-task', dest='start_at_task',
                      help="start the playbook at the task matching this name")

    self.options, self.args = parser.parse_args(self.args[1:])

    self.parser = parser

    if len(self.args) == 0:
        raise Exception("You must specify a playbook file to run")

    # display.verbosity = self.options.verbosity
    self.validate_conflicts(runas_opts=True, vault_opts=True, fork_opts=True)

def list_tags():
    # ansible playbook specific opts
    # parser.add_argument('--list-tasks', dest='listtasks', action='store_true',
    #                   help="list all tasks that would be executed")
    # parser.add_argument('--list-tags', dest='listtags', action='store_true',
    #                   help="list all available tags")
    # parser.add_argument('--step', dest='step', action='store_true',
    #                   help="one-step-at-a-time: confirm each task before running")
    # parser.add_argument('--start-at-task', dest='start_at_task',
    #                   help="start the playbook at the task matching this name")
    #
    # parser.add_argument('--inventory_file', help='Inventory Filename', required=True)
    # parser.add_argument('--playbook_path', help='Inventory Filename', required=True)

    parser = CLI.base_parser(
        usage="%prog playbook.yml",
        connect_opts=True,
        meta_opts=True,
        runas_opts=True,
        subset_opts=True,
        check_opts=True,
        inventory_opts=True,
        runtask_opts=True,
        vault_opts=True,
        fork_opts=True,
        module_opts=True,
    )

    # ansible playbook specific opts
    parser.add_option('--list-tasks', dest='listtasks', action='store_true',
                      help="list all tasks that would be executed")
    parser.add_option('--list-tags', dest='listtags', action='store_true',
                      help="list all available tags")
    parser.add_option('--step', dest='step', action='store_true',
                      help="one-step-at-a-time: confirm each task before running")
    parser.add_option('--start-at-task', dest='start_at_task',
                      help="start the playbook at the task matching this name")

    options, args = parser.parse_args(args[1:])

    # options = parser.parse_args()

    inventory_path = options.inventory_file
    playbook_path = options.playbook_path

    if not os.path.exists(playbook_path):
        print('[ERROR] The playbook does not exist')
        sys.exit(1)

    loader = DataLoader()

    # initial error check, to make sure all specified playbooks are accessible
    # before we start running anything through the playbook executor
    # for playbook in playbooks:
    #     if not os.path.exists(playbook):
    #         raise Exception("the playbook: %s could not be found" % playbook)
    #     if not (os.path.isfile(playbook) or stat.S_ISFIFO(os.stat(playbook).st_mode)):
    #         raise Exception("the playbook: %s does not appear to be a file" % playbook)

    # create the variable manager, which will be shared throughout
    # the code, ensuring a consistent view of global variables
    variable_manager = VariableManager()
    # variable_manager.extra_vars = load_extra_vars(loader=loader, options=options)

    # variable_manager.options_vars = load_options_vars(options)

    # create the inventory, and filter it based on the subset specified (if any)
    inventory = Inventory(loader=loader, variable_manager=variable_manager, host_list=inventory_path)
    variable_manager.set_inventory(inventory)

    # (which is not returned in list_hosts()) is taken into account for
    # warning if inventory is empty.  But it can't be taken into account for
    # checking if limit doesn't match any hosts.  Instead we don't worry about
    # limit if only implicit localhost was in inventory to start with.
    #
    # Fix this when we rewrite inventory by making localhost a real host (and thus show up in list_hosts())
    no_hosts = False
    if len(inventory.list_hosts()) == 0:
        # Empty inventory
        print("provided hosts list is empty, only localhost is available")
        no_hosts = True
    # inventory.subset(options.subset)
    if len(inventory.list_hosts()) == 0 and no_hosts is False:
        # Invalid limit
        raise Exception("Specified --limit does not match any hosts")

    # flush fact cache if requested
    # if options.flush_cache:
    #     for host in inventory.list_hosts():
    #         variable_manager.clear_facts(host)

    passwords = {}

    # create the playbook executor, which manages running the plays via a task queue manager
    pbex = PlaybookExecutor(playbooks=[playbook_path], inventory=inventory, variable_manager=variable_manager,
                            loader=loader, options=options, passwords=passwords)

    results = pbex.run()

    if isinstance(results, list):
        for p in results:

            print('\nplaybook: %s' % p['playbook'])
            for idx, play in enumerate(p['plays']):
                msg = "\n  play #%d (%s): %s" % (idx + 1, ','.join(play.hosts), play.name)
                mytags = set(play.tags)
                msg += '\tTAGS: [%s]' % (','.join(mytags))

                if options.listhosts:
                    playhosts = set(inventory.get_hosts(play.hosts))
                    msg += "\n    pattern: %s\n    hosts (%d):" % (play.hosts, len(playhosts))
                    for host in playhosts:
                        msg += "\n      %s" % host

                print(msg)

                all_tags = set()
                if options.listtags or options.listtasks:
                    taskmsg = ''
                    if options.listtasks:
                        taskmsg = '    tasks:\n'

                    def _process_block(b):
                        taskmsg = ''
                        for task in b.block:
                            if isinstance(task, Block):
                                taskmsg += _process_block(task)
                            else:
                                if task.action == 'meta':
                                    continue

                                all_tags.update(task.tags)
                                if options.listtasks:
                                    cur_tags = list(mytags.union(set(task.tags)))
                                    cur_tags.sort()
                                    if task.name:
                                        taskmsg += "      %s" % task.get_name()
                                    else:
                                        taskmsg += "      %s" % task.action
                                    taskmsg += "\tTAGS: [%s]\n" % ', '.join(cur_tags)

                        return taskmsg

                    all_vars = variable_manager.get_vars(loader=loader, play=play)
                    play_context = PlayContext(play=play, options=options)
                    for block in play.compile():
                        block = block.filter_tagged_tasks(play_context, all_vars)
                        if not block.has_tasks():
                            continue
                        taskmsg += _process_block(block)

                    if options.listtags:
                        cur_tags = list(mytags.union(all_tags))
                        cur_tags.sort()
                        taskmsg += "      TASK TAGS: [%s]\n" % ', '.join(cur_tags)

                    print(taskmsg)

def main():
    global parser
    parser = argparse.ArgumentParser()
    parser.add_argument('command', help='Command Type - [host_vars, play_vars]')
    args, unknown = parser.parse_known_args()

    if args.command == 'host_vars':
        host_vars()
    elif args.command == 'play_vars':
        play_vars()
    elif args.command == 'role_vars':
        role_vars()
    elif args.command == 'list':
        list_tags()


if __name__ == '__main__':
    main()
