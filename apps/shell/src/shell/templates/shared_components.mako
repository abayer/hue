<!--
 Licensed to Cloudera, Inc. under one
 or more contributor license agreements.  See the NOTICE file
 distributed with this work for additional information
 regarding copyright ownership.  Cloudera, Inc. licenses this file
 to you under the Apache License, Version 2.0 (the
 "License"); you may not use this file except in compliance
 with the License.  You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-->

<%!
#declare imports here, for example:
#import datetime
%>

<%!
import datetime
from django.template.defaultfilters import urlencode, escape
%>
<%def name="header(title='Hue Shell', toolbar=True)">
  <!DOCTYPE html PUBLIC "-//W3C//DTD HTML 4.01//EN">
  <html>
    <head>
      <title>${title}</title>
    </head>
    <body>
      % if toolbar:
      <div class="toolbar">
        <img src="/shell/static/art/shell.png" class="shell_icon"/>
        <a target="Shell" data-icon-styles="{'width': 16, 'height': 16}" class="plus_button">New Window</a>
      </div>
      % endif
</%def>

<%def name="footer()">
    </body>
  </html>
</%def>
