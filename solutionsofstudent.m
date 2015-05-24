function [ turk,sos,mat,fen ] = solutionsofstudent( emptyform,filledform,outputFilePath)
%STUDENTSOLUTÝON Summary of this function goes here
%   Detailed explanation goes here
tic

I = imread(filledform);

% imshow(I)

centers=opticalform(emptyform);
%%%
% figure
level = graythresh(I);
BW = im2bw(I,level);%0.85 önceki
% imshow(BW)

st = regionprops(BW );
a=zeros(1,length(st));

for k = 1 : length(st)
    thisBB = st(k).BoundingBox;
    a(k)=thisBB(4);
end

sorteda=sort(a);
len=length(sorteda);
x=sorteda(len-4:len-1);%en uzun 4 dikdörtgen ana optik dikdörtgen haric
c=zeros(1,4);%en uzun 4 dikdörtgenin sýrasýyla kaçýncý bounding box olduðunu tutuyo
temp=1;

%%
while(temp<=4)
    c1=find(a==x(temp));
    temp2=length(c1);
    c(temp:temp+temp2-1)=c1;
    temp=temp+temp2;
    
end

temp=zeros(4);

%%

for k=1:4
    
    thisBB=st(c(k)).BoundingBox;
    temp(k,:)=thisBB;
    
%     rectangle('Position', [thisBB(1),thisBB(2),thisBB(3),thisBB(4)],...
%         'EdgeColor','r','LineWidth',2 )
   
end
temp=sortrows(temp,1);%rectangleri soldan saða sýraladý

 rectangles=cell(1,4);
 
for i=1:4
    rectangles{i}=BW(ceil(temp(i,2)):ceil((temp(i,2)+temp(i,4))),ceil(temp(i,1)):ceil((temp(i,1)+temp(i,3))));
end

solutions=cell(1,4);
for k=1:4
r=70;
center1=centers{k};
rect=rectangles{k};
% figure,imshow(rect);
rect=imresize(rect,3);

percentage=zeros(size(center1,1),1);
center1=sortrows(center1,2);
t=1;

while t<size(center1,1)%bu fonksiyon önce y'e göre ardýndan ilk 5 þýkký xe göre sýraladý
    center1(t:t+4,:)=sortrows(center1(t:t+4,:),1);
    t=t+5;
end

for i=1:size(center1,1)
    c=center1(i,:);
    c=round(c);
    c=c-r;%çemberi kaplayan en küçük dikdörtgenin sol üst köþesi
    x=c(1):c(1)+2*r;
    x=repmat(x,2*r+1,1);
    x=reshape(x,1,[]);
    y=(c(2):c(2)+2*r)';
    y=repmat(y,1,2*r+1);
    y=reshape(y,1,[]);
    x1=[x',y'];
    
      B = x1((x1(:,1)-center1(i,1)).^2+(x1(:,2)-center1(i,2)).^2<=r^2,:);
      coordinates=size(rect,1)*(B(:,1)-1)+B(:,2);
      sado=rect(coordinates);
      p=sum(~sado);
      percentage(i)=p/size(sado,1);
%     hold on
%     plot(B(:,1),B(:,2),'k.')

end
solution=percentage>0.5;
solution=reshape(solution,5,45);
solution=solution';
solutions{k}=solution(1:40,:);


end
turk=solutions{1};
sos=solutions{2};
mat=solutions{3};
fen=solutions{4};
toc

fileID = fopen(outputFilePath,'w');
fprintf(fileID,'%d',turk');
fprintf(fileID,'%d',sos');
fprintf(fileID,'%d',mat');
fprintf(fileID,'%d',fen');
fclose(fileID);




end

%%
function [ centers ] = opticalform( filename )
%OPTÝCALFORM Summary of this function goes here
%   Detailed explanation goes here
tic
I = imread(filename);
% imshow(I)

centers=cell(1,4);
%%%
% figure
level = graythresh(I);
BW = im2bw(I,level);%0.85 önceki
% imshow(BW)

st = regionprops(BW );
a=zeros(1,length(st));

for k = 1 : length(st)
    thisBB = st(k).BoundingBox;
    a(k)=thisBB(4);
end

sorteda=sort(a);
len=length(sorteda);
x=sorteda(len-4:len-1);%en uzun 4 dikdörtgen ana optik dikdörtgen haric
c=zeros(1,4);%en uzun 4 dikdörtgenin sýrasýyla kaçýncý bounding box olduðunu tutuyo
temp=1;

%%
while(temp<=4)
    c1=find(a==x(temp));
    temp2=length(c1);
    c(temp:temp+temp2-1)=c1;
    temp=temp+temp2;
    
end

temp=zeros(4);

%%

for k=1:4
    
    thisBB=st(c(k)).BoundingBox;
    temp(k,:)=thisBB;
    
%     rectangle('Position', [thisBB(1),thisBB(2),thisBB(3),thisBB(4)],...
%         'EdgeColor','r','LineWidth',2 )
%    
end
temp=sortrows(temp,1);

rectangles=cell(1,4);
for i=1:4
    rectangles{i}=BW(ceil(temp(i,2)):ceil((temp(i,2)+temp(i,4))),ceil(temp(i,1)):ceil((temp(i,1)+temp(i,3))));
end

for k=1:4
% figure
% imshow(rectangles{k})

temp=circdetectfun2(imresize(rectangles{k},3));
% kazim=temp{2};
centers{k}=temp{1};
end
toc
end

function [ output ] = circdetectfun2( input )
%CÝRCDETECTFUN Summary of this function goes here
%   Detailed explanation goes here
 
[centers, radii] = imfindcircles(input,[55 64], 'ObjectPolarity','dark', ...
          'Sensitivity',0.93,'Method','twostage');

output=cell(1,2);
output{1}=centers;
output{2}=radii;

% figure
% imshow(input);
% viscircles(centers,radii);
end

