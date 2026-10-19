#!/bin/sh
# Removes the optional Home-button hook. Leaves the launcher app installed.
# Does not reboot; does not touch SAM/surface-manager. Reboot normally afterwards
# if you want the Home button fully back to LG's behaviour immediately.
rm -f /var/lib/webosbrew/init.d/50-tvos-home
[ -f /tmp/tvos-home-svc.pid ] && kill -9 "$(cat /tmp/tvos-home-svc.pid)" 2>/dev/null
rm -f /tmp/tvos-home-svc.pid
rm -rf /var/lib/tvos-launcher-home
echo "Home hook removed."
