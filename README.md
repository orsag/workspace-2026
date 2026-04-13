# TestMonorepo

COPYRIGHT AND PROPRIETARY NOTICE
=================================

Copyright (c) 2026. All Rights Reserved.

This software and its associated documentation (the "Software") are proprietary to the author.
The Software is NOT open-source.

PROHIBITIONS:
1. USE: Use of this Software is permitted only for the specific purpose for which it was provided.
2. COPYING: You may not copy, duplicate, or reproduce the Software in any form.
3. MODIFICATION: You may not modify, alter, or create derivative works from the Software.
4. DISTRIBUTION: You may not distribute, share, sublicense, or sell the Software to any third party.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES
OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Spring effect
Yes, this visual effect is very well known in web and mobile development! 
It is officially called "Rubber-banding" or "Overscroll Bounce".

It is natively built into macOS (when using a trackpad) and iOS/Android devices. However, standard Windows browsers usually do not have this effect (they just stop dead at the top).

When you use a sticky navbar on a standard website, the native "rubber band" effect pulls the entire body of the HTML down. This pulls your sticky navbar away from the top of the screen, exposing the background color of the <body> element underneath, which looks ugly.

To create a true "App-like" spring effect where the navbar stays perfectly locked to the top while the content underneath it springs and bounces, you need to use the App Shell Layout Pattern.

Instead of letting the browser scroll the <body>, we lock the body to the exact height of the screen (h-screen overflow-hidden) and make a div inside it handle the scrolling.

Now, on Mac/iOS/Android, when the user pulls down at the top of the page, the content will physically pull away from the bottom of the navbar and spring back, while the navbar stays perfectly frozen in place.

- [Avatar](https://www.flaticon.com/free-icons/on)
- [Globe](https://www.flaticon.com/free-icons/world)
