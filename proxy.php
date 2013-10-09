<?php

define('USER_AGENT', 'ngSocial Counter (https://github.com/esvit/angular-social)');

function fetch($encUrl) {
    $options = array(
        CURLOPT_RETURNTRANSFER  => true, // return web page
        CURLOPT_HEADER          => false, // don't return headers
        CURLOPT_FOLLOWLOCATION  => true, // follow redirects
        CURLOPT_ENCODING        => '', // handle all encodings
        CURLOPT_USERAGENT       => USER_AGENT, // who am i
        CURLOPT_AUTOREFERER     => true, // set referer on redirect
        CURLOPT_CONNECTTIMEOUT  => 5, // timeout on connect
        CURLOPT_TIMEOUT         => 10, // timeout on response
        CURLOPT_MAXREDIRS       => 3, // stop after 3 redirects
        CURLOPT_SSL_VERIFYHOST  => 0,
        CURLOPT_SSL_VERIFYPEER  => false,
    );
    $ch = curl_init();

    $options[CURLOPT_URL] = $encUrl;
    curl_setopt_array($ch, $options);

    $content = curl_exec($ch);

    curl_close($ch);
    return $content;
}

$json = array('url' => '', 'count' => 0);
$json['url'] = $_GET['url'];
$url = urlencode($_GET['url']);
$type = urlencode($_GET['type']);

if (!filter_var($_GET['url'], FILTER_VALIDATE_URL)) {
    exit('Invalid url');
}
switch ($type) {
    case 'google-plus':
        $content = fetch('https://plusone.google.com/u/0/_/+1/fastbutton?hl=en&url=' . $url . '&count=true');

        $dom = new DOMDocument;
        $dom->preserveWhiteSpace = false;
        @$dom->loadHTML($content);
        $domxpath = new DOMXPath($dom);
        $newDom = new DOMDocument;
        $newDom->formatOutput = true;

        $filtered = $domxpath->query('//div[@id=\'aggregateCount\']');
        if (isset($filtered->item(0)->nodeValue)) {
            $json['count'] = str_replace('>', '', $filtered->item(0)->nodeValue);
        }
        break;
    case 'stumbleupon':
        $content = fetch('http://www.stumbleupon.com/services/1.01/badge.getinfo?url=' . $url);

        $result = json_decode($content);
        if (isset($result->result->views)) {
            $json['count'] = $result->result->views;
        }
        break;
}

$response = json_encode($json);

if (isset($_GET['callback'])) {
    $response = $_GET['callback'] . '(' . $response . ')';
}

header('content-type: application/json; charset=UTF-8');

echo $response;