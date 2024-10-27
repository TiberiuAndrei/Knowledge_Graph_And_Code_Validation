We use the following endpoint to check whether a file exists in a bitbucket repo or not:

curl --request GET \
  --url 'https://api.bitbucket.org/2.0/repositories/{workspace}/{repo_slug}/src/{commit}/{path}' \
  --header 'Authorization: Bearer <access_token>' \
  --header 'Accept: application/json'


docs: https://developer.atlassian.com/cloud/bitbucket/rest/api-group-source/#api-repositories-workspace-repo-slug-src-commit-path-get