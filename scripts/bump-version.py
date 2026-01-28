#!/usr/bin/env python3

import re
import subprocess
import json

# Ensure that git tag has been set
resp = input("Have you set the git tag for the new version? (y/N):")
if resp.lower() != "y" and resp.lower() != "yes":
    exit(1)

# Get git tag of current and previous versions
version = subprocess.check_output("git describe --tags --abbrev=0", text=True, shell=True).strip()[1:]
prev_version = subprocess.check_output("git describe --tags --abbrev=0 HEAD^", text=True, shell=True).strip()[1:]

print("Current version:", version)
print("Previous version:", prev_version)

# Fail if current and previous versions are the same
if version == prev_version:
    print("error: Current and previous version are the same")
    exit(1)

# Read changelog
with open("CHANGELOG.md") as f:
    changelog = f.read()

# Check if changelog contains an entry for the new version
if len(re.findall(rf"## v{version}", changelog)) == 0:
    print("error: Changelog does not contain an entry for the new version")
    exit(1)


#############################
# REPLACE VERSIONS IN FILES #
#############################

print("Processing client/manifest.json")
with open("client/manifest.json", "r+") as f:
    obj = json.load(f)
    f.seek(0)
    obj["version"] = version
    json.dump(obj, f, indent=2)
    f.write("\n")
    f.truncate()

print("Processing client/package.json")
with open("client/package.json", "r+") as f:
    obj = json.load(f)
    f.seek(0)
    obj["version"] = version
    json.dump(obj, f, indent=2)
    f.write("\n")
    f.truncate()

print("Processing server/package.json")
with open("server/package.json", "r+") as f:
    obj = json.load(f)
    f.seek(0)
    obj["version"] = version
    json.dump(obj, f, indent=2)
    f.write("\n")
    f.truncate()

print("Processing client/package-lock.json")
with open("client/package-lock.json", "r+") as f:
    obj = json.load(f)
    f.seek(0)
    obj["version"] = version
    obj["packages"][""]["version"] = version
    json.dump(obj, f, indent=2)
    f.write("\n")
    f.truncate()

print("Processing server/package-lock.json")
with open("server/package-lock.json", "r+") as f:
    obj = json.load(f)
    f.seek(0)
    obj["version"] = version
    obj["packages"][""]["version"] = version
    json.dump(obj, f, indent=2)
    f.write("\n")
    f.truncate()

print("Processing client/updates.json")
with open("client/updates.json", "r+") as f:
    obj = json.load(f)
    f.seek(0)
    updates = obj["addons"]["klo-client@goisser.net"]["updates"]
    updates.append({
        "version": version,
        "update_link": f"https://git.goisser.net/api/packages/Benjamin/generic/klo-client/v{version}/klo-client-v{version}.xpi"
    })
    json.dump(obj, f, indent=2)
    f.write("\n")
    f.truncate()

