#!/usr/bin/env python3

import re
import sys
import json
import os

if len(sys.argv) != 2:
    print(f"Usage:")
    print(f"  {sys.argv[0]} <version>")
    print(f"Note: ")
    print(f"  <version> is only accepted in the format /\\d{{1,}}\\.\\d{{1,}}\\.\\d{{1,}}/")
    exit(1)

version = sys.argv[1]

# Check if working tree is dirty
if os.system("git diff --quiet") != 0 or os.system("git diff --staged --quiet") != 0:
    print("error: Working tree is dirty. Commit or discard all changes before bumping the version")
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

#############################


def yesno(prompt: str):
    resp = input(f"{prompt} [y/N]: ")
    return resp.lower() == "y" or resp.lower() == "yes"


if yesno(f"Do you want to create a bump version commit with the message 'Bump version to v{version}'?"):
    os.system("git add .")
    os.system(f"git commit -m 'Bump version to v{version}'")
else:
    exit(0)


if yesno("Do you want to push the commit?"):
    os.system("git push")
else:
    exit(0)


if yesno(f"Do you want to create a git tag 'v{version}'?"):
    os.system(f"git tag v{version}")
else:
    exit(0)


if yesno("Do you want to push the tag?"):
    os.system("git push --tags")
else:
    exit(0)
