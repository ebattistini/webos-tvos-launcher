#!/bin/sh
# OPTIONAL: make the Home button (and boot) open the tvOS launcher. ROOTED TVs ONLY
# (Homebrew Channel with root). Run on the TV as root:  sh install.sh
#
# What it does: copies a tiny Node watcher to /var/lib/tvos-launcher-home and adds ONE
# Homebrew init.d hook (/var/lib/webosbrew/init.d/50-tvos-home). It reads remote key
# events and calls applicationManager/launch. It does not modify LG system files,
# firmware, SAM, or update settings. Undo with uninstall.sh.
#
# WARNING: never restart SAM / surface-manager (systemctl restart sam, killing sam,
# etc.) to "apply" this. That can leave a black screen. Just reboot normally if needed.
set -e
DIR=/var/lib/tvos-launcher-home
SRC="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$DIR" /var/lib/webosbrew/init.d
cp "$SRC/service.js" "$DIR/service.js"
cat > "$DIR/autostart.sh" << 'EOS'
#!/bin/sh
DIR=/var/lib/tvos-launcher-home
[ -f "$DIR/service.js" ] || exit 0
[ -f /tmp/tvos-home-svc.pid ] && kill -9 "$(cat /tmp/tvos-home-svc.pid)" 2>/dev/null
cd "$DIR"
nohup /usr/bin/node service.js --boot --watch >/tmp/tvos-home-svc.stdout 2>&1 &
exit 0
EOS
chmod +x "$DIR/autostart.sh"
ln -sf "$DIR/autostart.sh" /var/lib/webosbrew/init.d/50-tvos-home
"$DIR/autostart.sh"
echo "Installed. Press Home to test. Log: /tmp/tvos-home-svc.log. Undo: sh uninstall.sh"
