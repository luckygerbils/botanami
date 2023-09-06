#!/usr/bin/env nix-shell
#! nix-shell -i python3 -p python39
from http.server import SimpleHTTPRequestHandler
import ssl
from socketserver import TCPServer

context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
context.load_cert_chain(
    certfile=".certbot/live/botanami.apps.anasta.si/fullchain.pem", 
    keyfile=".certbot/live/botanami.apps.anasta.si/privkey.pem")

class DistHandler(SimpleHTTPRequestHandler):
    def __init__(self, request, client_address, server):
        SimpleHTTPRequestHandler.__init__(self, request, client_address, server, directory="dist")

TCPServer.allow_reuse_address = True
httpd = TCPServer(('0.0.0.0', 443), DistHandler)
httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
httpd.serve_forever()
