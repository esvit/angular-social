Angular Social
==============
Code licensed under New BSD License.

Example you can see at this page: http://bazalt-cms.com/ng-table/

Using:

```
<ul ng-social-buttons
     data-url="'http://news.mistinfo.com/'"
     data-title="'test'"
     data-description="'test2'"
     data-image="'http://s3.mistinfo.com/32/d8/32d8eab76f4c242f665bda66b5edc6c5.jpg'">
    <li>Share:</li>
    <li class="ng-social-facebook">Facebook</li>
    <li class="ng-social-google-plus">Google+</li>
    <li class="ng-social-twitter">Twitter</li>
    <li class="ng-social-vk">Вконтакте</li>
    <li class="ng-social-odnoklassniki">Одноклассники</li>
    <li class="ng-social-mailru">Мой мир</li>
    <li class="ng-social-pinterest">Pinterest</li>
    <li class="ng-social-github" user="esvit" repository="ng-table">GitHub</li>
    <li class="ng-social-github-forks" user="esvit" repository="ng-table">Forks</li>
</ul>
```

```
angular.module('main', ['ngSocial'])
```
