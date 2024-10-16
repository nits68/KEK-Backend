# KEK-Backend

Base repo:
https://github.com/nitslaszlo/jedlik-express-mongoose-ts-backend-template-session

Backend deployment
https://rigid-pearline-nits-b71ca532.koyeb.app/

# Munkamenet
## Mindenki a saját nevével (vnév-knév) azonosított munka branch-ben dolgozzon!
- esze-gabor
- horvat-gabor
- tompos-richard
- nits-laszlo

## Ha a munka branch-ed (vnév-knév) le van maradva (behind) a main branch-től
```
git fetch --all --prune
git checkout vnév-knév
git rebase origin/main
```
Ha konfliktus van, akkor azt fel kell oldani!<br>
Feloldás után a rebase folytatása (csak ha konfliktus volt és sikerült feloldani):
```
git rebase --continue
```
Rebase-elt branch-ed feltöltése a távoli (origin) repository-ba:
```
git push -f origin vnév-knév
```
